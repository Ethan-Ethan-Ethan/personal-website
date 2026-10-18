---
type: reference
status: active
domain: career
created: 2026-06-11
updated: 2026-07-18
tags:
  - project/resume
aliases:
  - English Resume
  - Hardware Engineer CV
verification_status: partial
source_exempt: true
---

# HW Engineer Resume

> Based on [[04_Projects/硬體開發素材/03-Source Notes/硬體專案索引|硬體專案索引]] (Project Index)
> Canonical: [[04_Projects/個人網站/履歷|履歷.md]]; this file is the English derivative.
> Chinese version → [[履歷 - 硬體工程師]]

---

## Summary

Full-stack Hardware Engineer with **10+ years** of experience in Server/NB platform power design (2009–2022), specializing in:

- **Power Design:** VR12/VR13 multi-phase voltage regulation, DC-DC converters, Power Integrity
- **Platform Integration:** x86 Server power architecture, Power Sequencing, SVID protocol
- **Validation & Debug:** Load Transient, Bode Plot, EMC troubleshooting, system-level issue analysis
- **Full Lifecycle:** Schematic → Layout → Bring-up → Validation → Production

---

## Skills

| Area | Competencies |
|------|-------------|
| **VR Design** | VR12/12.5/13, DrMOS, Multiphase Buck, Loadline, SVID, IMVP |
| **DC-DC** | Buck, Boost, LDO, Coupled Inductor, POL, PMBus |
| **PI/PDN** | Target Impedance, Decoupling Network, PDN Simulation, Anti-resonance |
| **SI** | DDR3/4, PCIe Gen3, USB 3.0 high-speed design |
| **EMC** | EMI Filter, Layout for EMC, Pre-scan debug, FCC/CE certification |
| **Tools** | OrCAD Capture/Allegro, PADS, Labview, Matlab/Simulink |
| **Measurement** | Oscilloscope, Spectrum Analyzer, VNA, Electronic Load, Bode Plot injection |
| **Standards** | Intel VR Platform Design Guide, Dell HW Specification, SVID Protocol |

---

## Professional Experience

### Wistron Corporation — Power Engineer（~2009 – 2016）

**Dell Platforms:**

| Period | Project | Key Technologies |
|--------|---------|-----------------|
| 2014–2015 | **Brawn** — Dell Server Power Design | VR12, DrMOS, 8-phase high-current, EMC certification |
| 2014–2015 | **One-Spark** — Dell Server Platform | VR13 feasibility study, Platform power design |
| 2012–2013 | **Radon** — Dell Server Platform Power | VR12, Multiphase Buck, Loadline calibration, PI validation |
| 2012 | **LEO** — Dell Server Platform | Power tree design, full VR validation, Ripple/Transient |
| 2011–2012 | **TAU** — Dell Server Platform | Multi-rail VR design, Power sequence, Issue analysis |
| 2011–2012 | **Exothermic Scorpion** — Thermal Analysis | FET loss modeling, thermal countermeasures, production fix |
| 2009–2010 | **Snow White** — Dell Server Platform | Platform power bring-up, initial VR validation |

**Other Clients:**

| Period | Project | Key Technologies |
|--------|---------|-----------------|
| 2015–2016 | **Rover** — P-Card/Expander | PCIe/SATA power, multi-rail design |
| 2013–2014 | **Plasma** — Server Power | Fast transient response, PI optimization |
| 2013–2014 | **Steeljaw** — Server Platform | Power sequence, VR validation |
| 2014–2015 | **Assassin** — Server Power | VR design validation |
| 2015 | **Mojo** — Server Power | High-density VR design |

### Freelance / Other（2016–2022）

| Period | Project | Key Technologies |
|--------|---------|-----------------|
| ~2022 | **Jinxun 2C** — USB PD Charger | USB PD 3.0, Type-C, Buck-Boost, PD protocol |

---

## Key Problem-Solving Cases

| Issue | Project | Resolution |
|-------|---------|------------|
| **Exothermic Issue** | Scorpion | MOSFET loss model → switching/timing tuning + thermal fix → 15°C temp reduction |
| **VR Loadline Shift** | Radon | AC/DC Loadline independent calibration → DCR RC match correction |
| **EMI High-Freq Spike** | Brawn | Snubber design + Gate resistor tuning → FCC/CE Class B pass |
| **Power Sequence Glitch** | TAU | PG chain delay recalculation → RC parameter adjustment |

---

## Quantifiable Achievements

- Designed power subsystems for **10+** Dell Server platforms (Grantley/Brickland generations)
- **Exothermic Issue** project: cross-team (Thermal/ME/HW) root-cause analysis → production fix
- Direct technical liaison with **Dell and Intel** clients for VR/PI support
- Full lifecycle: Schematic → Layout → Bring-up → DVT → PVT → MP

---

## Education & Certifications

<!-- TODO: add your education details -->

---

## Next Steps

- [ ] Select 3–5 key projects and write detailed contributions
- [ ] Tailor focus for target role (Server Power Engineer vs FAE vs System Design)
- [x] Added time periods
- [x] English version
- [ ] Create a single-page condensed resume
- [ ] Add education details

---

## References

- [[04_Projects/硬體開發素材/03-Source Notes/硬體專案索引|硬體專案索引]] — Full project directory
- [[履歷 - 硬體工程師]] — Chinese version
- `~/Documents/硬體開發工作/履歷/` — Existing resume files
