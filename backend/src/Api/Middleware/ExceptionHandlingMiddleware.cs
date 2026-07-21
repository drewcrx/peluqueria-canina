using System.Net;
using System.Text.Json;
using PeluqueriaSaas.Application.Common.Exceptions;
using ValidationException = PeluqueriaSaas.Application.Common.Exceptions.ValidationException;

namespace PeluqueriaSaas.Api.Middleware;

/// <summary>
/// Single place mapping Application-layer exceptions to HTTP status codes — handlers throw
/// plain exceptions and never touch HttpContext directly.
/// </summary>
public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException ex)
        {
            await WriteAsync(context, HttpStatusCode.BadRequest, new { message = ex.Message, errors = ex.Errors });
        }
        catch (NotFoundException ex)
        {
            await WriteAsync(context, HttpStatusCode.NotFound, new { message = ex.Message });
        }
        catch (ConflictException ex)
        {
            await WriteAsync(context, HttpStatusCode.Conflict, new { message = ex.Message });
        }
        catch (ForbiddenException ex)
        {
            await WriteAsync(context, HttpStatusCode.Forbidden, new { message = ex.Message });
        }
        catch (AuthenticationException ex)
        {
            await WriteAsync(context, HttpStatusCode.Unauthorized, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error no controlado procesando {Path}", context.Request.Path);
            await WriteAsync(context, HttpStatusCode.InternalServerError, new { message = "Ocurrió un error inesperado." });
        }
    }

    private static Task WriteAsync(HttpContext context, HttpStatusCode statusCode, object body)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;
        return context.Response.WriteAsync(JsonSerializer.Serialize(body));
    }
}
