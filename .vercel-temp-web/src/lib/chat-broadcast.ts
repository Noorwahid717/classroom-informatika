// Utility untuk broadcasting chat messages
const chatClients: Set<ReadableStreamDefaultController> = new Set()

// Function untuk menambahkan client baru
export function addChatClient(controller: ReadableStreamDefaultController) {
  chatClients.add(controller)
}

// Function untuk menghapus client
export function removeChatClient(controller: ReadableStreamDefaultController) {
  chatClients.delete(controller)
}

// Function untuk broadcast chat messages ke semua connected clients
export function broadcastChatMessage(data: {
  type: string;
  message: string;
  senderName: string;
  sessionId?: string;
  timestamp: Date;
}) {
  const message = `data: ${JSON.stringify(data)}\n\n`
  
  const clientsCopy = Array.from(chatClients)
  
  clientsCopy.forEach(controller => {
    try {
      controller.enqueue(message)
    } catch {
      chatClients.delete(controller)
    }
  })
}

// Function untuk mendapatkan jumlah connected clients
export function getChatClientsCount(): number {
  return chatClients.size
}