const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")

const pluginDir = path.resolve(__dirname, "..")
const manifest = JSON.parse(fs.readFileSync(path.join(pluginDir, "manifest.json"), "utf8"))
const readme = fs.readFileSync(path.join(pluginDir, "README.md"), "utf8")

test("publication manifest declares the bar-widget contract and license", () => {
  assert.equal(manifest.schemaVersion, 1)
  assert.match(manifest.id, /^[A-Za-z0-9][A-Za-z0-9._-]*$/)
  assert.equal(manifest.id.startsWith("omarchy."), false)
  assert.equal(manifest.license, "MIT")
  assert.deepEqual(manifest.kinds, ["bar-widget"])
  assert.equal(manifest.entryPoints.barWidget, "BarWidget.qml")
  assert.equal(manifest.barWidget.defaultSection, "center")
  assert.equal(fs.existsSync(path.join(pluginDir, manifest.entryPoints.barWidget)), true)
})

test("publication repository contains documentation for safe lifecycle", () => {
  assert.equal(fs.existsSync(path.join(pluginDir, "LICENSE")), true)
  assert.match(readme, /omarchy plugin add .*--enable/)
  assert.match(readme, /omarchy plugin disable/)
  assert.match(readme, /omarchy plugin enable/)
  assert.match(readme, /omarchy plugin remove/)
  assert.match(readme, /LICENSE/)
  assert.match(readme, /hyprctl monitors -j/)
})
