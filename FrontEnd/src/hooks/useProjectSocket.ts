import { useEffect } from "react";
import { getSocket } from "../services/socket";

interface UseProjectSocketOptions {
  projectId: string | undefined;
  onTicketCreated:   (ticket: any) => void;
  onTicketUpdated:   (ticket: any) => void;
  onTicketDeleted:   (ticketId: string) => void;
  onSprintCreated:   (sprint: any) => void;
  onSprintUpdated:   (sprint: any) => void;
  onSprintDeleted:   (sprintId: string) => void;
  onSprintClosed:    (sprint: any) => void;
  onProjectUpdated:  (project: any) => void;
  onMemberChanged:   () => void;
}

export function useProjectSocket({
  projectId,
  onTicketCreated,
  onTicketUpdated,
  onTicketDeleted,
  onSprintCreated,
  onSprintUpdated,
  onSprintDeleted,
  onSprintClosed,
  onProjectUpdated,
  onMemberChanged,
}: UseProjectSocketOptions) {
  useEffect(() => {
    if (!projectId) return;

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit("join:project", projectId);

    socket.on("ticket:created",  ({ ticket })  => onTicketCreated(ticket));
    socket.on("ticket:updated",  ({ ticket })  => onTicketUpdated(ticket));
    socket.on("ticket:deleted",  ({ ticketId }) => onTicketDeleted(ticketId));
    socket.on("sprint:created",  ({ sprint })  => onSprintCreated(sprint));
    socket.on("sprint:updated",  ({ sprint })  => onSprintUpdated(sprint));
    socket.on("sprint:deleted",  ({ sprintId }) => onSprintDeleted(sprintId));
    socket.on("sprint:closed",   ({ sprint })  => onSprintClosed(sprint));
    socket.on("project:updated", ({ project }) => onProjectUpdated(project));
    socket.on("member:added",    () => onMemberChanged());
    socket.on("member:removed",  () => onMemberChanged());

    return () => {
      socket.emit("leave:project", projectId);
      socket.off("ticket:created");
      socket.off("ticket:updated");
      socket.off("ticket:deleted");
      socket.off("sprint:created");
      socket.off("sprint:updated");
      socket.off("sprint:deleted");
      socket.off("sprint:closed");
      socket.off("project:updated");
      socket.off("member:added");
      socket.off("member:removed");
    };
  }, [projectId]);
}
