import QtQuick
import Quickshell
import Quickshell.Io
import qs.Commons
import qs.Ui
import "Model.js" as Model

// Read-only monitor status for the Omarchy bar.
BarWidget {
  id: root
  moduleName: "io.github.GustavoBitterly.monitor-pulse"

  property var monitors: []

  function refreshMonitors() {
    if (!monitorProcess.running) monitorProcess.running = true
  }

  function applyMonitorOutput(output, exitCode) {
    root.monitors = exitCode === 0 ? Model.parseMonitors(output) : []
  }

  function open() {
    if (panelLoader.item) panelLoader.item.open()
  }

  function close() {
    if (panelLoader.item) panelLoader.item.close()
  }

  function togglePanel() {
    if (panelLoader.item) panelLoader.item.toggle()
  }

  readonly property bool opened: panelLoader.item ? panelLoader.item.opened === true : false
  readonly property bool popoutSwitchClosing: panelLoader.item
    ? panelLoader.item.popoutSwitchClosing === true : false

  function closeForPopoutSwitch() {
    if (panelLoader.item && panelLoader.item.closeForPopoutSwitch)
      panelLoader.item.closeForPopoutSwitch()
  }

  function injectPanel() {
    var target = panelLoader.item
    if (!target) return
    if ("bar" in target) target.bar = root.bar
    if ("settings" in target) target.settings = root.settings
    if ("anchorItem" in target) target.anchorItem = button
    if ("hostWidget" in target) target.hostWidget = root
    if ("monitors" in target) target.monitors = root.monitors
  }

  implicitWidth: button.implicitWidth
  implicitHeight: button.implicitHeight

  onBarChanged: injectPanel()
  onSettingsChanged: injectPanel()
  onMonitorsChanged: injectPanel()

  Process {
    id: monitorProcess
    command: ["/usr/bin/hyprctl", "monitors", "-j"]

    stdout: StdioCollector {
      id: monitorStdout
      waitForEnd: true
    }

    stderr: StdioCollector { waitForEnd: true }

    onExited: function(exitCode) {
      root.applyMonitorOutput(monitorStdout.text, exitCode)
    }
  }

  Loader {
    id: panelLoader
    active: true
    source: Qt.resolvedUrl("Panel.qml")
    visible: false
    onLoaded: {
      root.injectPanel()
      Qt.callLater(root.injectPanel)
    }
  }

  IpcHandler {
    target: "io.github.GustavoBitterly.monitor-pulse"

    function refresh(): void { root.broadcast("refreshMonitors") }
    function open(): void { root.open() }
    function close(): void { root.close() }
    function show(): void { root.open() }
    function hide(): void { root.close() }
    function toggle(): void { root.togglePanel() }
  }

  BarIconButton {
    id: button
    anchors.fill: parent
    bar: root.bar
    text: "󱎴"
    tooltipText: "Monitor Pulse"

    onPressed: function(b) {
      if (b === Qt.LeftButton) root.togglePanel()
    }
  }
}
