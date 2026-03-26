import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Client, CreateClientPayload, UpdateClientPayload } from '@/types/client'

interface ClientStore {
  clients: Client[]
  addClient: (payload: CreateClientPayload) => Client
  updateClient: (payload: UpdateClientPayload) => void
  deleteClient: (id: string) => void
  getClientById: (id: string) => Client | undefined
  getClientsByCaseId: (caseId: string) => Client[]
  linkClientToCase: (clientId: string, caseId: string) => void
  unlinkClientFromCase: (clientId: string, caseId: string) => void
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clients: [],

      addClient: (payload) => {
        const newClient: Client = {
          id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...payload,
          caseIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ clients: [...state.clients, newClient] }))
        return newClient
      },

      updateClient: (payload) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === payload.id
              ? { ...client, ...payload, updatedAt: new Date().toISOString() }
              : client
          ),
        }))
      },

      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id),
        }))
      },

      getClientById: (id) => {
        return get().clients.find((client) => client.id === id)
      },

      getClientsByCaseId: (caseId) => {
        return get().clients.filter((client) => client.caseIds.includes(caseId))
      },

      linkClientToCase: (clientId, caseId) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === clientId && !client.caseIds.includes(caseId)
              ? {
                  ...client,
                  caseIds: [...client.caseIds, caseId],
                  updatedAt: new Date().toISOString(),
                }
              : client
          ),
        }))
      },

      unlinkClientFromCase: (clientId, caseId) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === clientId
              ? {
                  ...client,
                  caseIds: client.caseIds.filter((id) => id !== caseId),
                  updatedAt: new Date().toISOString(),
                }
              : client
          ),
        }))
      },
    }),
    {
      name: 'dadyar-clients',
    }
  )
)
