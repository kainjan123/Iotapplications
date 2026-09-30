import { getStore } from "@netlify/blobs";
export const config = { path: "/api/*" };
const PIN = process.env.HOST_PIN || "iot2026";
const STORE = [["PIR Motion Sensor",10],["LDR",5],["Door/Window Sensor",10],["Temperature Sensor",10],["Gas Sensor",15],["ESP32",20],["Wi-Fi Connectivity",10],["Cloud Storage",15],["Buzzer",10],["Smart Light",10],["Smart Fan",15],["Smart Lock",20],["Camera",30],["Mobile Alert",15],["Water Flow Sensor",15],["Accelerometer",15]];
const NAMES = ["Sensor Squad","Circuit Sleuths","Packet Detectives","Edge Guardians","Cloud Chasers","Signal Sherlocks","Volt Vigilantes","Mesh Marshals","Byte Bloodhounds","Ping Patrol","Pulse Protectors","Smart Home Heroes"];
// [title, evidence, core[], good[]]  (indexes into STORE)
const CASES = [
["Unauthorized Door Entry","Door opened • Motion detected • Owner away. At 11:42 PM the front door opened. A motion sensor detected movement 20 seconds later. The owner's phone showed Away. Design a system that detects unauthorized entry and alerts the owner.",[2,0,5,6,13],[8,12,7]],
["Window Intrusion","Window opened • PIR event • No door event. At 1:10 AM the living-room window was opened; motion was detected near it; no door event. Distinguish a real intrusion from a harmless event.",[2,0,5,6,13],[8,7]],
["Kitchen Gas Leak","Gas level rising • Kitchen empty • Temperature normal. At 8:15 PM a gas sensor rises rapidly. Detect the danger and act without waiting for a person.",[4,5,8,10],[13,6,3]],
["Water Leakage","Wet area • No occupancy • Possible water flow. At 6:30 AM the bathroom floor is wet but nobody is using it. Detect abnormal flow and minimize damage.",[14,5,6,13],[8,7]],
["AC / Energy Waste","Room empty • AC ON • Setpoint 18°C. Empty for 45 minutes. Reduce energy waste without making the room uncomfortable when occupants return.",[0,3,5,10],[6,7,13]],
["Empty Room, Lights On","No occupancy • Lights ON • Daylight available. Empty 30 minutes, lights still ON. Control lighting from occupancy and ambient light.",[0,1,5,9],[6]],
["Child Safety","Door opens • Child zone • Adult elsewhere. A child opens the main door while the parent is in another room. Alert the responsible adult without unnecessary alarms.",[2,0,5,6,13],[8]],
["Elderly Emergency","Abnormal inactivity • Fall-like motion • Emergency risk. No movement for an unusually long period, then a fall-like event. Design the emergency response.",[15,0,5,6,13],[8,7]],
["Pet or Intruder?","Repeated night motion • Pet present • Identity uncertain. A PIR detects movement every night: sometimes the dog, sometimes a person. Reduce false alarms.",[0,5,6,13],[12,2,7,15]],
["Smart Garage Security","Garage open • No family vehicle • Late night. Garage door opens at 2:05 AM and the family car is not detected. Verify the event and protect the garage.",[2,0,5,12,13,6],[11,8,7]],
["Night-time False Alarm","Repeated PIR • No expected activity • False alarm suspected. At midnight the system reports motion though the family sleeps. Use more than one source of evidence before a high-priority alarm.",[0,2,5,6,13],[8,1,12]],
["Complete Smart Home","Open design • Multiple competing requirements. Choose a mix of security, comfort and energy functions. Balance cost, reliability, privacy and convenience.",[5,6,0,2,13],"ALL"]];
const G = (l, r) => [l, new RegExp(r, "i")];
const ATK = [
["Wi-Fi Failure","The Internet connection has failed. Your system must keep protecting the home. What local/edge decision can still operate?",[G("local / edge decision on the ESP32","local|edge|offline|on.?device|esp32|onboard"),G("local alert or action (buzzer, lock, light)","buzzer|siren|alarm|lock|light|fan|actuat|relay"),G("buffering / backup connectivity","buffer|store|queue|sync|later|resume|retry|cellular|gsm|backup|sd card")]],
["PIR False Reading","The PIR is giving a false motion event. How will your system verify the event?",[G("second sensor to confirm","second|another|two|multiple|combine|confirm|verify|cross|door|window|camera|accelerometer"),G("time filtering / debounce","time|delay|debounce|repeat|threshold|twice|consecutive|filter|window"),G("escalate only when confirmed","only if|only when|confirm|escalat|then alert|before alert|notify")]],
["Owner Arrives Without Phone","The owner comes home but their phone is unavailable. How will your system avoid a false alarm?",[G("alternative authentication (PIN, RFID, keypad)","pin|keypad|code|rfid|card|fingerprint|face|password|manual|disarm|button|voice"),G("entry grace period","delay|grace|timer|wait|countdown|entry|seconds"),G("other evidence of a known person","router|geofenc|bluetooth|second|family|schedule|routine|known|learn|wifi|wi-fi")]],
["Low Battery / Power","Power is limited. Which functions are essential and which can be temporarily disabled?",[G("essential safety/security functions kept","essential|critical|priority|safety|security|gas|door|alarm|core"),G("non-essential functions disabled","disable|turn off|switch off|pause|reduce|non.?essential|light|fan|comfort|cloud"),G("low-power strategy","battery|backup|ups|solar|power bank|sleep|low.?power|duty|interval|sampling|wake|interrupt")]],
["Camera Unavailable","A privacy rule prevents camera use. Redesign the system without visual identification.",[G("non-visual sensors used","pir|motion|door|window|sensor|accelerometer|sound|contact"),G("evidence combined (sensor fusion / patterns)","combine|multiple|two|fusion|pattern|sequence|time|schedule|logic|both"),G("alert or verification path","alert|notify|mobile|buzzer|lock|owner|manual|verify|confirm")]],
["Sensor Failure","Your primary sensor stops reporting. What backup or fallback logic will you use?",[G("backup / redundant sensor","backup|redundan|secondary|second|another|fallback|alternate|spare"),G("failure detection (heartbeat / timeout)","heartbeat|watchdog|health|no data|timeout|stopped|missing|self.?test|monitor"),G("fail-safe action / notify","alert|notify|mobile|safe|default|fail.?safe|lock|shut|buzzer")]],
["Cloud Unavailable","Cloud services cannot be reached. What must happen locally?",[G("local processing on ESP32","local|edge|offline|on.?device|esp32|onboard"),G("local actuator still works","buzzer|siren|alarm|lock|light|fan|actuat|relay"),G("queue and sync later","buffer|store|queue|sync|later|resume|retry|log|cache")]],
["Pet Trigger","A pet repeatedly triggers the motion sensor. How will you reduce false alarms?",[G("second sensor / pet-aware verification","pet.?immune|height|weight|dual|two|second|combine|multiple|door|window|camera|accelerometer"),G("tuning (sensitivity, angle, zone, schedule)","threshold|sensitivity|angle|zone|mount|lower|adjust|calibrat|schedule|night|pattern"),G("alert only if confirmed","only if|only when|confirm|verify|filter|ignore|notify")]],
["Multiple People","Two people enter at different times. What evidence should be combined before an alarm?",[G("entry events combined","door|entry|window|pir|sensor|camera|event|combine|both"),G("time / sequence / count tracking","time|window|timeout|sequence|count|occupancy|log|session|separately|each|state"),G("authorization check before alarm","only|unless|authori[sz]ed|known|phone|verify|confirm|alarm")]],
["Data Privacy Complaint","A resident objects to continuous data collection. What data can you minimize or avoid storing?",[G("data minimization / local processing","minimi|less|only|avoid|not store|no storage|delete|anonym|aggregate|edge|local"),G("retention & protection (encrypt, auto-delete, consent)","encrypt|consent|opt|retention|expire|auto.?delete|days|access|permission|password"),G("what to drop (raw video, location, personal data)","camera|video|image|raw|location|personal|event|summary|count|flag|no recording|disable")]],
["Emergency Override","A user needs to manually override the automation. Where should manual control exist?",[G("manual control (switch/button/app)","switch|button|manual|physical|key|panel|app|remote|mobile|override|mode"),G("placed at the device / location","lock|light|fan|door|actuator|device|local|wall|near|next to"),G("safe automation pause / authentication","automation|auto|pause|disable|resume|pin|password|authenticat|log")]],
["Conflicting Sensors","Door sensor says OPEN while the occupancy sensor says EMPTY. How should the system handle contradictory data?",[G("priority / cross-check rule","priority|rule|trust|weigh|reliab|cross.?check|third|another|vote|majority|compare|fusion"),G("flag uncertainty / verify","flag|unknown|uncertain|alert|verify|log|check|mark|state|conflict|anomaly|error"),G("recheck / recalibrate / timeout","camera|pir|sensor|reset|calibrat|timeout|time|retry|recheck|re.?read|maintenance")]]];
const words = s => (String(s).trim().match(/\S+/g) || []).length;
const total = m => (m.sens||0)+(m.cost||0)+(m.rule||0)+(m.attack||0);
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
export default async (req) => {
  const st = getStore({ name: "iot", consistency: "strong" });
  const path = new URL(req.url).pathname.replace(/^\/api\//, "").replace(/\/$/, "");
  const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
  const host = req.headers.get("x-host-pin") === PIN;
  const getT = n => st.get("team-" + n, { type: "json" });
  const N = () => { const n = +body.n; return n >= 1 && n <= 12 ? n : 0; };
  const game = async () => (await st.get("game", { type: "json" })) || { reveal: false };
  const all = async () => { const r = []; for (let n = 1; n <= 12; n++) { const t = await getT(n); if (t) r.push(t); } return r; };
  const rank = ts => ts.filter(t => t.stage >= 3).map(t => ({ n: t.n, name: t.name, spent: t.spent, m: t.m, total: total(t.m), at: t.at }))
    .sort((a, b) => b.total - a.total || a.spent - b.spent || a.at - b.at);
  if (path === "game") return json(await game());
  if (path === "results") { const g = await game(); return json(g.reveal ? { reveal: true, ranking: rank(await all()) } : { reveal: false }); }
  if (path === "board") { if (!host) return json({ error: "bad pin" }, 401); const ts = await all(); return json({ game: await game(), teams: ts.map(t => ({ ...t, total: total(t.m || {}), attackTitle: t.attackIdx != null ? ATK[t.attackIdx][0] : null })) }); }
  if (path === "host") {
    if (!host) return json({ error: "bad pin" }, 401);
    if (body.action === "reveal" || body.action === "hide") { await st.setJSON("game", { reveal: body.action === "reveal" }); return json({ ok: 1 }); }
    if (body.action === "reset") { const { blobs } = await st.list(); for (const b of blobs) await st.delete(b.key); return json({ ok: 1 }); }
    return json({ error: "unknown" }, 400);
  }
  const n = N(); if (!n) return json({ error: "team 1-12 required" }, 400);
  let t = await getT(n);
  const view = t => ({ n: t.n, name: t.name, stage: t.stage, spent: t.spent || 0, picks: t.picks || [], rule: t.rule || "", m: t.m || {}, fb: t.fb || {}, change: t.change || "",
    caseTitle: CASES[n-1][0], caseText: CASES[n-1][1], attack: t.attackIdx != null ? { title: ATK[t.attackIdx][0], text: ATK[t.attackIdx][1] } : null });
  if (path === "join") {
    if (!t) { t = { n, name: NAMES[n-1], stage: 1, m: {}, fb: {}, at: Date.now() }; await st.setJSON("team-" + n, t); }
    return json(view(t));
  }
  if (!t) return json({ error: "join first" }, 400);
  if (path === "store") {
    if (t.stage > 1) return json(view(t));
    const picks = [...new Set((body.picks || []).map(Number).filter(i => i >= 0 && i < STORE.length))];
    const spent = picks.reduce((a, i) => a + STORE[i][1], 0);
    if (spent > 100) return json({ error: "OVER BUDGET", spent }, 400);
    const [, , core, good] = CASES[n-1];
    const hit = core.filter(i => picks.includes(i)).length;
    const irr = good === "ALL" ? 0 : picks.filter(i => !core.includes(i) && !good.includes(i)).length;
    const cov = hit / core.length;
    const rule = String(body.rule || "").slice(0, 400);
    const r = (/\bif\b/i.test(rule) ? 5 : 0) + (/\bthen\b/i.test(rule) ? 5 : 0) + ((/\band\b|&|\bor\b/i.test(rule) && words(rule) >= 10) ? 5 : 0);
    t = { ...t, stage: 2, picks, spent, rule, m: { sens: Math.max(0, Math.round(40 * cov) - 5 * irr), cost: Math.round(10 * cov * Math.min(1, (100 - spent) / 25)), rule: r },
      fb: { store: `Essential components found: ${hit} of ${core.length}.` + (irr ? ` ${irr} unnecessary item(s) (−${5*irr}).` : "") + ` Coins left: ${100 - spent}.`, rule: r === 15 ? "Rule uses IF … AND … THEN clearly." : "Tip: a strong rule reads IF <sensor A> AND <sensor B> THEN <action>." } };
    await st.setJSON("team-" + n, t); return json(view(t));
  }
  if (path === "attack") {
    if (t.stage < 2) return json({ error: "finish the store first" }, 400);
    if (t.attackIdx == null) {
      const used = (await all()).map(x => x.attackIdx).filter(x => x != null);
      const free = ATK.map((_, i) => i).filter(i => !used.includes(i)); const pool = free.length ? free : ATK.map((_, i) => i);
      t = { ...t, attackIdx: pool[Math.floor(Math.random() * pool.length)] }; await st.setJSON("team-" + n, t);
    }
    return json(view(t));
  }
  if (path === "change") {
    if (t.attackIdx == null) return json({ error: "no attack yet" }, 400);
    if (t.stage >= 3) return json(view(t));
    const change = String(body.change || "").slice(0, 800);
    const groups = ATK[t.attackIdx][2]; const hits = groups.filter(([, re]) => re.test(change));
    const spec = words(change) >= 20 && /esp32|pir|sensor|buzzer|camera|lock|light|fan|cloud|wi-?fi|door|gas|accelerometer|ldr|flow|mobile/i.test(change) ? 5 : 0;
    const m = { ...t.m, attack: hits.length * 10 + spec };
    t = { ...t, stage: 3, change, m, at: Date.now(), fb: { ...t.fb,
      attack: hits.length ? "Covered: " + hits.map(h => h[0]).join("; ") + "." : "No key idea matched yet.",
      missed: groups.filter(g => !hits.includes(g)).map(g => g[0]),
      spec: spec ? "Good specificity (named components, full explanation)." : "Add more detail: ≥20 words and name the components you change." } };
    await st.setJSON("team-" + n, t); return json(view(t));
  }
  return json({ error: "not found" }, 404);
};
