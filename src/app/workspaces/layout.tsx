import { ClientGuard } from "@/components/ClientGuard";

export default function WorkspacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientGuard>{children}</ClientGuard>;
}
