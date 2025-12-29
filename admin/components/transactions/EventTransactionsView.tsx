"use client"

import { useEffect, useState } from "react"
import { TransactionStats } from "./TransactionStats"
import { TransactionList } from "./TransactionList"
import { TransactionSearch } from "./TransactionSearch"
import { getEventTransactions } from "@/lib/admin"
import { EventTransactionsResponse } from "@/types/transaction"
import { toast } from "sonner"

interface EventTransactionsViewProps {
  eventId: string
}

export function EventTransactionsView({ eventId }: EventTransactionsViewProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<EventTransactionsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) {
      setError("Event ID is required")
      setLoading(false)
      return
    }

    let mounted = true

    async function fetchTransactions() {
      try {
        setLoading(true)
        setError(null)
        const response = await getEventTransactions(eventId)
        
        if (!mounted) return

        if (!response.success) {
          throw new Error(response.message || "Failed to fetch transactions")
        }

        setData(response)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load transactions"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchTransactions()

    return () => {
      mounted = false
    }
  }, [eventId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
        <p className="text-destructive">{error || "Failed to load transactions"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <TransactionStats totals={data.totals} />
      <TransactionSearch />
      <TransactionList transactions={data.transactions} />
    </div>
  )
}
