import QtQuick
import QtQuick.Controls
import Quickshell
import qs.Commons
import qs.Ui
import "Model.js" as Model

// Read-only list of monitor state, refreshed whenever the panel opens.
Panel {
  id: root
  moduleName: "io.github.GustavoBitterly.monitor-pulse"
  ipcTarget: "io.github.GustavoBitterly.monitor-pulse"
  manageIpc: false

  property var anchorItem: null
  property var hostWidget: null
  property var monitors: []
  property string activeMonitorName: ""
  readonly property string language: Model.languageCode(Qt.locale().name)
  readonly property var activeMonitor: Model.monitorByName(root.monitors, root.activeMonitorName)
  readonly property var barIdentity: hostWidget || root
  readonly property color contentForeground: bar ? bar.foreground : Color.foreground
  readonly property string contentFontFamily: bar ? bar.fontFamily : Style.font.family

  function refreshFromHost() {
    if (root.hostWidget && root.hostWidget.refreshMonitors)
      root.hostWidget.refreshMonitors()
  }

  function open() {
    refreshFromHost()
    var window = root.anchorItem ? root.anchorItem.QsWindow.window : null
    var screen = window ? window.screen : null
    root.activeMonitorName = screen ? String(screen.name || "") : ""
    root.controller.show()
  }

  function close() {
    root.controller.hide()
  }

  function toggle() {
    if (root.opened) root.close()
    else root.open()
  }

  function closeForPopoutSwitch() {
    root.close()
  }

  function switchPanel(direction) {
    if (root.bar && typeof root.bar.switchPanelFrom === "function")
      return root.bar.switchPanelFrom(root.barIdentity, direction)
    return false
  }

  KeyboardPanel {
    id: panel
    anchorItem: root.anchorItem
    owner: root.barIdentity
    bar: root.bar
    open: root.opened
    centerOnBar: false
    focusTarget: keyCatcher
    contentWidth: panel.fittedContentWidth(Style.space(430))
    contentHeight: panel.fittedContentHeight(contentColumn.implicitHeight)

    PanelKeyCatcher {
      id: keyCatcher
      anchors.fill: parent
      onCloseRequested: root.close()
      onTabRequested: function(direction) { root.switchPanel(direction) }

      Flickable {
        anchors.fill: parent
        contentWidth: contentColumn.width
        contentHeight: contentColumn.implicitHeight
        clip: true
        interactive: contentHeight > height

        Column {
          id: contentColumn
          width: Math.max(parent.width, Style.space(390))
          spacing: Style.space(12)

          Text {
            width: parent.width
            text: "MONITOR PULSE"
            color: root.contentForeground
            font.family: root.contentFontFamily
            font.pixelSize: Style.font.title
            font.bold: true
          }

          Text {
            width: parent.width
            text: Model.label("activeMonitor", root.language)
            color: Qt.darker(root.contentForeground, 1.5)
            font.family: root.contentFontFamily
            font.pixelSize: Style.font.caption
            font.letterSpacing: 1
          }

          Repeater {
            model: [root.activeMonitor]

            Rectangle {
              required property var modelData
              readonly property var details: Model.monitorDetails(modelData, root.language)
              width: parent.width
              height: activeDetails.implicitHeight + Style.space(28)
              radius: Style.cornerRadius
              color: Qt.rgba(root.contentForeground.r, root.contentForeground.g, root.contentForeground.b, 0.08)

              Column {
                id: activeDetails
                anchors.fill: parent
                anchors.margins: Style.space(14)
                spacing: Style.space(4)

                Text {
                  text: details.name
                  color: root.contentForeground
                  font.family: root.contentFontFamily
                  font.pixelSize: Style.font.body
                  font.bold: true
                }

                Text {
                  text: "- " + Model.label("brand", root.language) + "  " + details.make
                  color: root.contentForeground
                  font.family: root.contentFontFamily
                  font.pixelSize: Style.font.bodySmall
                }

                Text {
                  text: "- " + Model.label("model", root.language) + "  " + details.model
                  color: root.contentForeground
                  font.family: root.contentFontFamily
                  font.pixelSize: Style.font.bodySmall
                }

                Text {
                  text: "- " + Model.label("resolution", root.language) + "  " + details.resolution
                  color: root.contentForeground
                  font.family: root.contentFontFamily
                  font.pixelSize: Style.font.bodySmall
                }

                Text {
                  text: "- " + Model.label("refreshRate", root.language) + "  " + details.refreshRate
                  color: root.contentForeground
                  font.family: root.contentFontFamily
                  font.pixelSize: Style.font.bodySmall
                }

                Text {
                  text: "- " + Model.label("hdr", root.language) + "  " + details.hdr
                  color: root.contentForeground
                  font.family: root.contentFontFamily
                  font.pixelSize: Style.font.bodySmall
                }

                Text {
                  text: "- " + Model.label("vrr", root.language) + "  " + details.vrr
                  color: root.contentForeground
                  font.family: root.contentFontFamily
                  font.pixelSize: Style.font.bodySmall
                }

                Text {
                  text: "- " + Model.label("gsync", root.language) + "  " + details.gsync
                  color: root.contentForeground
                  font.family: root.contentFontFamily
                  font.pixelSize: Style.font.bodySmall
                }

                Text {
                  text: "- " + Model.label("freesync", root.language) + "  " + details.freesync
                  color: root.contentForeground
                  font.family: root.contentFontFamily
                  font.pixelSize: Style.font.bodySmall
                }
              }
            }
          }

          Text {
            width: parent.width
            text: Model.label("allMonitors", root.language)
            color: Qt.darker(root.contentForeground, 1.5)
            font.family: root.contentFontFamily
            font.pixelSize: Style.font.caption
            font.letterSpacing: 1
          }

          Repeater {
            model: root.monitors

            Rectangle {
              required property var modelData
              readonly property var details: Model.monitorDetails(modelData, root.language)
              width: parent.width
              height: monitorDetails.implicitHeight + Style.space(20)
              radius: Style.cornerRadius
              color: "transparent"
              border.width: Style.spacing.hairline
              border.color: Qt.rgba(root.contentForeground.r, root.contentForeground.g, root.contentForeground.b, 0.18)

              Column {
                id: monitorDetails
                anchors.fill: parent
                anchors.margins: Style.space(10)
                spacing: Style.space(3)

                Text {
                  text: ("- " + Model.label("input", root.language) + " " + details.name + " "
                    + Model.activeLabel(modelData, root.language)).toUpperCase()
                  color: root.contentForeground
                  font.family: root.contentFontFamily
                  font.pixelSize: Style.font.body
                  font.bold: modelData.focused
                }

              }
            }
          }

          Text {
            visible: root.monitors.length === 0
            width: parent.width
            text: "N/A"
            color: root.contentForeground
            font.family: root.contentFontFamily
            font.pixelSize: Style.font.body
          }
        }
      }
    }
  }
}
