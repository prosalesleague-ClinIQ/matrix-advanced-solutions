'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { CartItem, CartState } from '@/lib/types/orders'
import type { ShippingMethod } from '@/lib/constants'
import { SHIPPING_METHODS } from '@/lib/constants'
import { getLineTotal } from '@/lib/pricing'

const CART_STORAGE_KEY = 'matrix-cart'

const EMPTY_CART: CartState = {
  items: {},
  shippingMethod: 'standard',
  updatedAt: new Date().toISOString(),
}

function loadCartFromStorage(): CartState {
  if (typeof window === 'undefined') return EMPTY_CART
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as CartState
    }
  } catch {
    // Corrupted localStorage — reset
  }
  return EMPTY_CART
}

function saveCartToStorage(state: CartState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage full or unavailable
  }
}

export interface CartContextValue {
  items: Record<string, CartItem>
  itemCount: number
  totalQuantity: number
  subtotal: number
  shippingCost: number
  shippingMethod: ShippingMethod
  total: number
  hydrated: boolean
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  setShippingMethod: (method: ShippingMethod) => void
  clearCart: () => void
  getItem: (productId: string) => CartItem | undefined
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(EMPTY_CART)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = loadCartFromStorage()
    setState(stored)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveCartToStorage(state)
  }, [state, hydrated])

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
      setState((prev) => {
        const existing = prev.items[item.productId]
        const newQuantity = existing ? existing.quantity + quantity : quantity
        return {
          ...prev,
          items: {
            ...prev.items,
            [item.productId]: {
              ...item,
              quantity: Math.max(1, newQuantity),
            },
          },
          updatedAt: new Date().toISOString(),
        }
      })
    },
    []
  )

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      setState((prev) => {
        if (quantity <= 0) {
          const { [productId]: _, ...rest } = prev.items
          return { ...prev, items: rest, updatedAt: new Date().toISOString() }
        }
        const existing = prev.items[productId]
        if (!existing) return prev
        return {
          ...prev,
          items: {
            ...prev.items,
            [productId]: { ...existing, quantity },
          },
          updatedAt: new Date().toISOString(),
        }
      })
    },
    []
  )

  const removeItem = useCallback((productId: string) => {
    setState((prev) => {
      const { [productId]: _, ...rest } = prev.items
      return { ...prev, items: rest, updatedAt: new Date().toISOString() }
    })
  }, [])

  const setShippingMethod = useCallback((method: ShippingMethod) => {
    setState((prev) => ({
      ...prev,
      shippingMethod: method,
      updatedAt: new Date().toISOString(),
    }))
  }, [])

  const clearCart = useCallback(() => {
    setState({
      items: {},
      shippingMethod: 'standard',
      updatedAt: new Date().toISOString(),
    })
  }, [])

  const getItem = useCallback(
    (productId: string) => state.items[productId],
    [state.items]
  )

  const itemEntries = Object.values(state.items)
  const itemCount = itemEntries.length
  const totalQuantity = itemEntries.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = itemEntries.reduce(
    (sum, item) => sum + getLineTotal(item.prices, item.quantity),
    0
  )
  const shippingCost = SHIPPING_METHODS[state.shippingMethod].price
  const total = subtotal + shippingCost

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount,
        totalQuantity,
        subtotal,
        shippingCost,
        shippingMethod: state.shippingMethod,
        total,
        hydrated,
        addItem,
        updateQuantity,
        removeItem,
        setShippingMethod,
        clearCart,
        getItem,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCartContext must be used within a <CartProvider>')
  }
  return ctx
}
