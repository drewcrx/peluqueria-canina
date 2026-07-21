import { api } from '../../lib/api'

export interface Product {
  id: string
  name: string
  stockQuantity: number
  minStock: number | null
  unitPrice: number | null
  isActive: boolean
  isLowStock: boolean
}

export interface StockMovement {
  id: string
  type: 'In' | 'Out'
  quantity: number
  reason: string | null
  createdAt: string
}

export interface ProductDetail {
  id: string
  name: string
  stockQuantity: number
  minStock: number | null
  unitPrice: number | null
  isActive: boolean
  movements: StockMovement[]
}

export async function listProducts(): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/products')
  return data
}

export async function getProductDetail(productId: string): Promise<ProductDetail> {
  const { data } = await api.get<ProductDetail>(`/products/${productId}`)
  return data
}

export async function createProduct(input: {
  name: string
  initialStock: number
  minStock?: number
  unitPrice?: number
}): Promise<string> {
  const { data } = await api.post<string>('/products', input)
  return data
}

export async function adjustStock(productId: string, type: 'In' | 'Out', quantity: number, reason?: string): Promise<void> {
  await api.post(`/products/${productId}/stock-movements`, { type, quantity, reason })
}
