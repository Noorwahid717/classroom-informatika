// Utility untuk broadcasting notification messages
const notificationClients: Set<ReadableStreamDefaultController> = new Set()

// Function untuk menambahkan client baru
export function addNotificationClient(controller: ReadableStreamDefaultController) {
  notificationClients.add(controller)
}

// Function untuk menghapus client
export function removeNotificationClient(controller: ReadableStreamDefaultController) {
  notificationClients.delete(controller)
}

// Function untuk broadcast notifications ke semua connected clients
export function broadcastToClients(data: {
  type: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}) {
  const message = `data: ${JSON.stringify(data)}\n\n`
  
  const clientsCopy = Array.from(notificationClients)
  
  clientsCopy.forEach(controller => {
    try {
      controller.enqueue(message)
    } catch {
      notificationClients.delete(controller)
    }
  })
}

// Function untuk mendapatkan jumlah connected clients
export function getNotificationClientsCount(): number {
  return notificationClients.size
}