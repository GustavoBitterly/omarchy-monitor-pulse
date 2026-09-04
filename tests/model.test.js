const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")

const pluginDir = path.resolve(__dirname, "..")
const Model = require(path.join(pluginDir, "Model.js"))

test("uses the display identifier from description as model", () => {
  const monitors = Model.parseMonitors(JSON.stringify([
    {
      name: "HDMI-A-1",
      description: "LG Electronics LG ULTRAGEAR 24GN600",
      model: "LG ULTRAGEAR",
      width: 1920,
      height: 1080,
      refreshRate: 144,
    },
  ]))

  assert.equal(monitors[0].model, "24GN600")

  const serialSuffix = Model.parseMonitors(JSON.stringify([
    {
      name: "HDMI-A-1",
      description: "LG Electronics LG ULTRAGEAR 24GN600 0x0000",
      model: "0x0000",
    },
  ]))
  assert.equal(serialSuffix[0].model, "24GN600")
})

test("selects the monitor belonging to the clicked bar screen", () => {
  const monitors = Model.parseMonitors(JSON.stringify([
    { name: "DP-1", focused: true, width: 2560, height: 1440, refreshRate: 144 },
    { name: "HDMI-A-1", focused: false, width: 1920, height: 1080, refreshRate: 60 },
  ]))

  assert.equal(Model.monitorByName(monitors, "HDMI-A-1").name, "HDMI-A-1")
  assert.equal(Model.monitorByName(monitors, "missing").name, "DP-1")
})

test("maps VRR mode values to the actual configured state", () => {
  const monitors = Model.parseMonitors(JSON.stringify([
    { name: "DP-1", vrr: 1, supportsVRR: true },
    { name: "HDMI-A-1", vrr: 0, supportsVRR: true },
    { name: "DP-2", supportsVRR: false },
  ]))

  assert.equal(Model.monitorDetails(monitors[0], "es_CL").vrr, "ACTIVO")
  assert.equal(Model.monitorDetails(monitors[1], "es_CL").vrr, "DESACTIVADO")
  assert.equal(Model.monitorDetails(monitors[2], "es_CL").vrr, "NO SOPORTADO")
})

test("localizes labels and status from the system locale", () => {
  assert.equal(Model.languageCode("en_US"), "en")
  assert.equal(Model.languageCode("es_CL"), "es")
  assert.equal(Model.label("active", "en_US"), "ACTIVE")
  assert.equal(Model.label("active", "es_CL"), "ACTIVO")
  assert.equal(Model.activeLabel({ focused: false }, "en_US"), "INACTIVE")
  assert.equal(Model.activeLabel({ focused: false }, "es_CL"), "INACTIVO")
})

test("the bar contains only the monitor icon", () => {
  const qml = fs.readFileSync(path.join(pluginDir, "BarWidget.qml"), "utf8")
  assert.match(qml, /text: "󱎴"/)
  assert.match(qml, /moduleName: "gbp\.monitor-pulse"/)
  assert.doesNotMatch(qml, /displayText/)
  assert.doesNotMatch(qml, /verticalLines/)
})

test("active monitor details are separate dashed lines", () => {
  const qml = fs.readFileSync(path.join(pluginDir, "Panel.qml"), "utf8")
  assert.match(qml, /moduleName: "gbp\.monitor-pulse"/)
  assert.match(qml, /ipcTarget: "gbp\.monitor-pulse"/)
  assert.match(qml, /Model\.label\("hdr", root\.language\)/)
  assert.match(qml, /Model\.label\("vrr", root\.language\)/)
  assert.match(qml, /Model\.label\("gsync", root\.language\)/)
  assert.match(qml, /Model\.label\("freesync", root\.language\)/)
  assert.match(qml, /Model\.label\("input", root\.language\)/)
  assert.match(qml, /Model\.activeLabel\(modelData, root\.language\)/)
  assert.match(qml, /\.toUpperCase\(\)/)
  assert.doesNotMatch(qml, /details\.make.*details\.model/)
  assert.doesNotMatch(qml, /details\.resolution.*details\.refreshRate/)
  assert.doesNotMatch(qml, /details\.hdr.*details\.vrr/)
  assert.doesNotMatch(qml, /details\.gsync.*details\.freesync/)
})
