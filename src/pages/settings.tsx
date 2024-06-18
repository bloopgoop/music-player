import { useUi } from "@/context/ui-provider";
import { usePlayer } from "@/context/player-provider";
import { useSettings } from "@/context/settings-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type Theme = "light" | "dark" | "system";

const Settings = () => {
  const ui = useUi();
  const player = usePlayer();
  const settings = useSettings();

  return (
    <div className="p-3 h-full w-full flex flex-col">
      <h1 className="text-center text-2xl font-bold mb-3">Settings</h1>
      <div className="grid grid-cols-[144px_1fr_144px] gap-6 items-center">
        <Label>Theme</Label>
        <Select value={ui.theme} onValueChange={(e) => ui.setTheme(e as Theme)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <div></div>

        <Label>Master Volume</Label>
        <Slider
          value={[player.masterVolume * 100]}
          onValueChange={(i) => player.setMasterVolume(i[0] / 100)}
          onValueCommit={(i) => {
            localStorage.setItem("masterVolume", String(i[0] / 100));
          }}
          className="h-1 rounded-full"
        />
        <Input
          value={player.masterVolume}
          type="number"
          onInput={(e) => {
            if (Number(e.currentTarget.value) > 100) {
              e.currentTarget.value = "100";
            }
            if (Number(e.currentTarget.value) < 0) {
              e.currentTarget.value = "0";
            }
            player.setMasterVolume(Number(e.currentTarget.value) / 100);
          }}
          className="text-center"
        />

        <Label>Airplane Mode</Label>
        <Switch />
        <div></div>

        <Label>Album reflection</Label>
        <Switch
          onCheckedChange={() => {
            localStorage.setItem("reflection", String(!settings.reflection));
            settings.setReflection(!settings.reflection);
          }}
          checked={settings.reflection}
        />
      </div>
    </div>
  );
};
export default Settings;
