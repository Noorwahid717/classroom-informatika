import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { env } from "@classroom/config/env";

@WebSocketGateway({
  cors: {
    origin: env.NEXT_PUBLIC_SITE_URL,
    credentials: true
  }
})
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  handleConnection() {
    // no-op
  }

  emitSubmissionUpdate(payload: { submissionId: string; status: string; score?: number }) {
    this.server.emit("submission.update", payload);
  }
}
