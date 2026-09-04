// Pure parsing and presentation helpers for Monitor Pulse.

function stringOrNA(value) {
  var text = String(value === undefined || value === null ? "" : value).trim()
  return text === "" ? "N/A" : text
}

function languageCode(localeName) {
  return String(localeName || "").toLowerCase().indexOf("es") === 0 ? "es" : "en"
}

function label(key, localeName) {
  var labels = {
    en: { activeMonitor: "ACTIVE MONITOR", allMonitors: "ALL MONITORS", brand: "BRAND", model: "MODEL", resolution: "RESOLUTION", refreshRate: "REFRESH RATE", hdr: "HDR", vrr: "VRR", gsync: "G-SYNC", freesync: "FREESYNC", input: "INPUT", active: "ACTIVE", inactive: "INACTIVE", disabled: "DISABLED", unsupported: "NOT SUPPORTED" },
    es: { activeMonitor: "MONITOR ACTIVO", allMonitors: "TODOS LOS MONITORES", brand: "MARCA", model: "MODELO", resolution: "RESOLUCIÓN", refreshRate: "FRECUENCIA", hdr: "HDR", vrr: "VRR", gsync: "G-SYNC", freesync: "FREESYNC", input: "ENTRADA", active: "ACTIVO", inactive: "INACTIVO", disabled: "DESACTIVADO", unsupported: "NO SOPORTADO" }
  }
  return labels[languageCode(localeName)][key] || key
}

function numberOrNull(value) {
  var number = Number(value)
  return isFinite(number) && number > 0 ? number : null
}

function firstField(value, names) {
  for (var i = 0; i < names.length; i++) {
    if (Object.prototype.hasOwnProperty.call(value, names[i])
        && value[names[i]] !== undefined && value[names[i]] !== null)
      return value[names[i]]
  }
  return null
}

function modelFromDescription(description, fallback) {
  var text = stringOrNA(description)
  if (text !== "N/A") {
    var words = text.split(/\s+/)
    for (var i = words.length - 1; i >= 0; i--) {
      var word = words[i].replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9-]+$/g, "")
      if (/[A-Za-z]/.test(word) && /\d/.test(word)
          && !/^0x[0-9a-f]+$/i.test(word)) return word
    }
  }
  return stringOrNA(fallback)
}

function normalizeMonitor(value) {
  if (!value || typeof value !== "object") return null

  var width = numberOrNull(value.width)
  var height = numberOrNull(value.height)
  var refreshRate = numberOrNull(value.refreshRate)
  var name = stringOrNA(value.name)

  if (name === "N/A" && width === null && height === null && refreshRate === null) return null

  return {
    name: name,
    description: stringOrNA(value.description),
    width: width,
    height: height,
    refreshRate: refreshRate,
    focused: value.focused === true,
    make: stringOrNA(value.make),
    model: modelFromDescription(value.description, value.model),
    features: {
      hdr: {
        active: firstField(value, ["hdr", "inHDR", "hdrActive", "hdr_active"]),
        supported: firstField(value, ["supportsHDR", "supports_hdr"])
      },
      vrr: {
        active: firstField(value, ["vrrActive", "vrr_active", "vrrEnabled", "vrr_enabled"]),
        configured: firstField(value, ["vrr"]),
        supported: firstField(value, ["supportsVRR", "supports_vrr"])
      },
      gsync: {
        active: firstField(value, ["gsync", "gSync", "gsyncActive", "gsync_active"]),
        supported: firstField(value, ["supportsGsync", "supportsGSync", "supports_gsync"])
      },
      freesync: {
        active: firstField(value, ["freesync", "freeSync", "freesyncActive", "freesync_active"]),
        supported: firstField(value, ["supportsFreesync", "supportsFreeSync", "supports_freesync"])
      }
    }
  }
}

function parseMonitors(text) {
  try {
    var values = JSON.parse(String(text || ""))
    if (!Array.isArray(values)) return []

    var monitors = []
    for (var i = 0; i < values.length; i++) {
      var monitor = normalizeMonitor(values[i])
      if (monitor) monitors.push(monitor)
    }
    return monitors
  } catch (error) {
    return []
  }
}

function primaryMonitor(monitors) {
  if (!Array.isArray(monitors)) return null
  for (var i = 0; i < monitors.length; i++) {
    if (monitors[i] && monitors[i].focused) return monitors[i]
  }
  return monitors.length > 0 ? monitors[0] : null
}

function monitorByName(monitors, name) {
  if (!Array.isArray(monitors)) return null
  var target = String(name || "").trim()
  if (target !== "") {
    for (var i = 0; i < monitors.length; i++) {
      if (monitors[i] && String(monitors[i].name) === target) return monitors[i]
    }
  }
  return primaryMonitor(monitors)
}

function resolution(monitor) {
  if (!monitor || monitor.width === null || monitor.height === null) return "N/A"
  return monitor.width + "×" + monitor.height
}

function refreshRate(monitor) {
  if (!monitor || monitor.refreshRate === null) return "N/A"
  var value = Number(monitor.refreshRate).toFixed(1)
  return value.replace(/\.0$/, "") + " Hz"
}

function booleanOrNull(value) {
  if (value === true || value === false) return value
  if (typeof value === "number" && isFinite(value)) return value !== 0
  if (typeof value !== "string") return null

  var text = value.trim().toLowerCase()
  if (["true", "yes", "on", "active", "enabled", "1"].indexOf(text) !== -1) return true
  if (["false", "no", "off", "inactive", "disabled", "0"].indexOf(text) !== -1) return false
  return null
}

function featureStatus(monitor, feature, localeName) {
  var data = monitor && monitor.features ? monitor.features[feature] : null
  if (!data) return label("unsupported", localeName)

  var active = booleanOrNull(data.active)
  if (active !== null) return active ? label("active", localeName) : label("disabled", localeName)

  var configured = booleanOrNull(data.configured)
  if (configured !== null) return configured ? label("active", localeName) : label("disabled", localeName)

  var supported = booleanOrNull(data.supported)
  return supported === true ? label("disabled", localeName) : label("unsupported", localeName)
}

function monitorLabel(monitor) {
  if (!monitor) return "N/A"
  return stringOrNA(monitor.name) + " · " + resolution(monitor) + " · " + refreshRate(monitor)
}

function monitorDetails(monitor, localeName) {
  if (!monitor) return {
    name: "N/A",
    make: "N/A",
    model: "N/A",
    resolution: "N/A",
    refreshRate: "N/A",
    hdr: label("unsupported", localeName),
    vrr: label("unsupported", localeName),
    gsync: label("unsupported", localeName),
    freesync: label("unsupported", localeName)
  }
  return {
    name: stringOrNA(monitor.name),
    make: stringOrNA(monitor.make),
    model: stringOrNA(monitor.model),
    resolution: resolution(monitor),
    refreshRate: refreshRate(monitor),
    hdr: featureStatus(monitor, "hdr", localeName),
    vrr: featureStatus(monitor, "vrr", localeName),
    gsync: featureStatus(monitor, "gsync", localeName),
    freesync: featureStatus(monitor, "freesync", localeName)
  }
}

function activeLabel(monitor, localeName) {
  return monitor && monitor.focused ? label("active", localeName) : label("inactive", localeName)
}

if (typeof module !== "undefined") {
  module.exports = {
    stringOrNA: stringOrNA,
    languageCode: languageCode,
    label: label,
    normalizeMonitor: normalizeMonitor,
    parseMonitors: parseMonitors,
    primaryMonitor: primaryMonitor,
    monitorByName: monitorByName,
    resolution: resolution,
    refreshRate: refreshRate,
    monitorLabel: monitorLabel,
    monitorDetails: monitorDetails,
    activeLabel: activeLabel
  }
}
