import { createFileRoute } from "@tanstack/react-router"
import { useTheme } from "@/components/theme-provider"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const Route = createFileRoute("/settings")({
  component: Settings,
})

function Settings() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your store preferences and network configuration.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Store Profile</CardTitle>
            <CardDescription>
              This is how your store will appear to connected devices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="store-name">Store Name</Label>
              <Input id="store-name" placeholder="My Awesome Store" defaultValue="Inventy Local Store" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="owner-email">Owner Email</Label>
              <Input id="owner-email" type="email" placeholder="owner@example.com" />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Save Profile</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Configuration</CardTitle>
            <CardDescription>
              Advanced settings for the local sync server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="port">Server Port</Label>
                <Input id="port" defaultValue="3000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="protocol">Protocol</Label>
                <Select defaultValue="http">
                  <SelectTrigger id="protocol">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="http">HTTP</SelectItem>
                    <SelectItem value="https">HTTPS (Web SSL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-md bg-muted p-4">
              <div className="text-sm font-medium">Local IP Address</div>
              <div className="text-xs text-muted-foreground break-all">
                The server is running at: <span className="font-mono text-foreground">http://192.168.1.50:3000</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button variant="secondary">Restart Server</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={(val) => setTheme(val as "light" | "dark" | "system")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
