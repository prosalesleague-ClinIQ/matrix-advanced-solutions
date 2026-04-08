'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  GripVertical,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Category {
  id: string
  name: string
  display_order: number
  is_active: boolean
  created_at: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editOrder, setEditOrder] = useState(0)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  async function fetchCategories() {
    try {
      const res = await fetch('/api/admin/categories')
      if (res.ok) {
        setCategories(await res.json())
      }
    } catch {
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  async function handleAdd() {
    if (!newName.trim()) return
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          display_order: categories.length,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add')
      }

      setNewName('')
      fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(id: string) {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: editName.trim(),
          display_order: editOrder,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }

      setEditingId(null)
      fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(cat: Category) {
    try {
      await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cat.id, is_active: !cat.is_active }),
      })
      fetchCategories()
    } catch {
      setError('Failed to update')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? Products using it must be reassigned first.')) return
    setError(null)

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }

      fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent-purple" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="flex items-center gap-1 text-sm text-steel-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Products
        </Link>
        <h1 className="text-2xl font-bold text-white">Product Categories</h1>
      </div>

      {error && (
        <div className="rounded-xl p-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
          {error}
        </div>
      )}

      {/* Add new category */}
      <Card>
        <CardHeader>
          <CardTitle>Add Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Category name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={saving || !newName.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category list */}
      <Card>
        <CardHeader>
          <CardTitle>Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-steel-500 text-sm py-4 text-center">No categories yet</p>
          ) : (
            <div className="space-y-1">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/5 transition-colors group"
                >
                  <GripVertical className="h-4 w-4 text-steel-600 shrink-0" />

                  {editingId === cat.id ? (
                    <>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                      />
                      <Input
                        type="number"
                        value={editOrder}
                        onChange={(e) => setEditOrder(parseInt(e.target.value) || 0)}
                        className="w-20"
                        placeholder="Order"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdate(cat.id)}
                        disabled={saving}
                      >
                        <Check className="h-4 w-4 text-green-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-white font-medium">
                        {cat.name}
                      </span>
                      <span className="text-xs text-steel-500 font-mono">
                        #{cat.display_order}
                      </span>
                      <Badge variant={cat.is_active ? 'accent' : 'default'}>
                        {cat.is_active ? 'Active' : 'Hidden'}
                      </Badge>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingId(cat.id)
                            setEditName(cat.name)
                            setEditOrder(cat.display_order)
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(cat)}
                        >
                          {cat.is_active ? 'Hide' : 'Show'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cat.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
