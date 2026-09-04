# Monitor Pulse

Widget `bar-widget` para Omarchy Quattro que muestra el monitor asociado a la
barra desde la que se abre el panel. La barra muestra el icono `monitor-eye`;
el panel muestra resolución, frecuencia, modelo, marca, HDR, VRR, G-Sync y
FreeSync del monitor activo. También lista todos los monitores conectados con
su entrada y estado `ACTIVE`/`INACTIVE`, traducidos según el locale del sistema.

## Dependencias de ejecución

- Omarchy Quattro y su shell basado en Quickshell.
- Hyprland con `hyprctl` disponible en `/usr/bin/hyprctl`.
- El módulo de fuente de iconos usado por Omarchy (Nerd Font con Material
  Design Icons, para `monitor-eye`).
- Los módulos QML de Omarchy: `qs.Commons` y `qs.Ui`.

El plugin no instala paquetes, no descarga recursos y no requiere red. Lee el
estado de los monitores mediante `hyprctl monitors -j` cada cinco segundos y al
abrir el panel.

## Instalación local

Copiar el directorio a la carpeta de plugins del usuario:

```bash
mkdir -p ~/.config/omarchy/plugins
cp -a gbp.monitor-pulse ~/.config/omarchy/plugins/gbp.monitor-pulse
```

Añadir `gbp.monitor-pulse` al layout de la barra en
`~/.config/omarchy/shell.json` y recargar:

```bash
omarchy restart shell
```

## Desarrollo y validación

Ejecutar desde la raíz del plugin:

```bash
# Pruebas funcionales del modelo JavaScript
node --test tests/model.test.js

# Validación del manifiesto y entry points del plugin
omarchy plugin validate .

# Validación sintáctica QML; el -I resuelve los módulos de Omarchy
qmllint -I /usr/share/omarchy/shell BarWidget.qml Panel.qml

# Validación JSON
jq empty manifest.json
```

La carpeta `tests/` comprueba parseo de monitores, selección por pantalla,
modelo EDID, VRR, localización, icono y contrato visual del panel.

## Comandos usados por el plugin

| Comando | Uso |
| --- | --- |
| `/usr/bin/hyprctl monitors -j` | Lee monitores, conectores, estado enfocado, modelo y capacidades. |
| `omarchy restart shell` | Recarga el shell después de instalar o modificar el plugin. |

Los comandos de validación (`node`, `omarchy plugin validate`, `qmllint` y
`jq`) se usan durante el desarrollo, no son dependencias de ejecución del
widget.

## Licencia

Distribuido bajo la licencia [MIT](LICENSE).
