# Monitor Pulse

An Omarchy Quattro `bar-widget`; The panel shows the active monitor's resolution, refresh rate, model,
brand, HDR, VRR, G-Sync, and FreeSync status. It also lists every connected
monitor with its input and `ACTIVE`/`INACTIVE` state, translated according to
the system locale.

<img width="408" height="380" alt="image" src="https://github.com/user-attachments/assets/3b531730-1e9d-4df0-8451-054cbaca0afa" />

## Runtime dependencies

- Omarchy Quattro and its Quickshell-based shell.
- Hyprland with `hyprctl` available at `/usr/bin/hyprctl`.
- Omarchy's icon font module (Nerd Font with Material Design Icons, for
  `monitor-eye`).
- Omarchy's QML modules: `qs.Commons` and `qs.Ui`.

The plugin does not install packages, download resources, or require network
access. It reads monitor state through `hyprctl monitors -j` only when the
panel is opened, so the information is refreshed on demand when you click the
bar widget.

## Installation

Install and enable the plugin directly from "Add Plugin":

```bash
https://github.com/GustavoBitterly/omarchy-monitor-pulse.git
```

From a terminal, run the complete command instead:

```bash
omarchy plugin add https://github.com/GustavoBitterly/omarchy-monitor-pulse.git --enable
```

The command clones the repository, validates `manifest.json`, installs it under
the manifest ID, and enables the bar widget. In an interactive terminal it may
ask which bar section should contain the widget. For a non-interactive install,
add `--yes`.

When a graphical prompt asks for a Git URL, enter only the URL above, not the
whole `omarchy plugin add ...` command.

### Manual installation

Alternatively, copy the directory to the user's plugin folder:

```bash
mkdir -p ~/.config/omarchy/plugins
cp -a . ~/.config/omarchy/plugins/io.github.GustavoBitterly.monitor-pulse
```

Add `io.github.GustavoBitterly.monitor-pulse` to the bar layout in
`~/.config/omarchy/shell.json`, then reload the shell:

```bash
omarchy restart shell
```

## Disable, re-enable, and remove

Disable the widget while keeping its files installed:

```bash
omarchy plugin disable io.github.GustavoBitterly.monitor-pulse
```

Enable it again, placing it in the center section:

```bash
omarchy plugin enable io.github.GustavoBitterly.monitor-pulse --section center
```

Remove the plugin and its installed copy:

```bash
omarchy plugin remove io.github.GustavoBitterly.monitor-pulse --yes
```

The remove command targets only this plugin ID. It does not remove Omarchy,
Hyprland, packages, or user monitor settings.

## Development and validation

Run these commands from the plugin root:

```bash
# Functional JavaScript model tests
node --test tests/*.test.js

# Validate the manifest and entry points
omarchy plugin validate .

# Validate QML syntax; -I resolves Omarchy modules
qmllint -I /usr/share/omarchy/shell BarWidget.qml Panel.qml

# Validate JSON
jq empty manifest.json
```

The `tests/` directory checks monitor parsing, per-screen selection, EDID model
detection, VRR, localization, the icon, the panel's visual contract, and the
publication manifest/documentation contract.

## Commands used at runtime

| Command | Purpose |
| --- | --- |
| `/usr/bin/hyprctl monitors -j` | Reads monitors, connectors, focused state, model, and capabilities. |
| `omarchy restart shell` | Reloads the shell after installing or modifying the plugin. |

The validation commands (`node`, `omarchy plugin validate`, `qmllint`, and
`jq`) are development tools, not runtime dependencies of the widget.

## Publication verification

Before submitting the public GitHub repository, run the checks above and then
verify the installed lifecycle in an active Omarchy Quattro session:

```bash
PLUGIN_ID="io.github.GustavoBitterly.monitor-pulse"
omarchy plugin list --json | jq --arg id "$PLUGIN_ID" '.[] | select(.id == $id)'
omarchy-shell shell summon "$PLUGIN_ID" '{}'
omarchy-shell shell hide "$PLUGIN_ID"
omarchy plugin disable "$PLUGIN_ID"
omarchy plugin enable "$PLUGIN_ID" --section center
omarchy restart shell
omarchy plugin remove "$PLUGIN_ID" --yes
```

Also test clicking the bar icon, closing the panel with Escape, multiple
monitors, and a monitor with unavailable capability data. The marketplace
does not certify plugin security; review all code and dependencies before
submitting because plugins run unsandboxed in the long-lived shell process.

## License

Distributed under the [MIT License](LICENSE).
