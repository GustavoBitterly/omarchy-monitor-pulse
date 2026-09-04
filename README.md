# Monitor Pulse

An Omarchy Quattro `bar-widget` with the namespace
`io.github.GustavoBitterly.monitor-pulse`. The bar shows the `monitor-eye`
icon; the panel shows the active monitor's resolution, refresh rate, model,
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
access. It reads monitor state through `hyprctl monitors -j` every five seconds
and whenever the panel opens.

## Local installation

Install and enable the plugin directly from GitHub:

```bash
omarchy plugin add https://github.com/GustavoBitterly/omarchy-monitor-pulse.git --enable
```

The command clones the repository, validates `manifest.json`, installs it under
the manifest ID, and enables the bar widget. In an interactive terminal it may
ask which bar section should contain the widget. For a non-interactive install,
add `--yes`.

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

## Development and validation

Run these commands from the plugin root:

```bash
# Functional JavaScript model tests
node --test tests/model.test.js

# Validate the manifest and entry points
omarchy plugin validate .

# Validate QML syntax; -I resolves Omarchy modules
qmllint -I /usr/share/omarchy/shell BarWidget.qml Panel.qml

# Validate JSON
jq empty manifest.json
```

The `tests/` directory checks monitor parsing, per-screen selection, EDID model
detection, VRR, localization, the icon, and the panel's visual contract.

## Commands used at runtime

| Command | Purpose |
| --- | --- |
| `/usr/bin/hyprctl monitors -j` | Reads monitors, connectors, focused state, model, and capabilities. |
| `omarchy restart shell` | Reloads the shell after installing or modifying the plugin. |

The validation commands (`node`, `omarchy plugin validate`, `qmllint`, and
`jq`) are development tools, not runtime dependencies of the widget.

## License

Distributed under the [MIT License](LICENSE).
