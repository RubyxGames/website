# DDUI manual smoke (phase 2 exit)

Client: **Minecraft Bedrock 1.26.60**, vanilla (no custom DDUI pack).

## Preconditions

- `pocketmine.yml` → `ddui.enabled: true`
- OP or `pocketmine.command.ddui`

## Checklist

| Step | Expected |
|------|----------|
| `/ddui` | JSON SimpleForm with six entries (launcher only) |
| Pick **MessageBox** | Two-button DDUI dialog; chat shows choice or dismiss |
| Pick **MessageBox (long body)** | Tooltips on buttons; same close behaviour |
| Pick **CustomForm — full** | Controls visible; Done button closes and returns to hub |
| Pick **CustomForm — minimal** | Single label; close returns to hub |
| Pick **CustomForm — reactive** | Top label updates ~every 2s; Ping + Lock toggle; closeButton |
| Replace test: open MessageBox, dismiss, pick another screen quickly | Second screen appears (~20 tick server delay) |
| Disconnect with DDUI open | No server errors; reconnect OK |

Record result here after test:

- [ ] Pass — date: ______ operator: ______
- [ ] Fail — symptom: ______

If a screen is blank or closes instantly: enable session recording (`session-recording.enabled`) and note protocol id from the minimal CustomForm status line or server log.
