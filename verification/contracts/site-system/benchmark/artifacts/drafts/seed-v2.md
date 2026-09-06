version: 1
system:
  id: personal-website
  generated_types: src/generated/site-system.ts
trunk:
  site-shell:
    owner: ethan
    depends_on: []
  command-bus:
    owner: ethan
    depends_on:
      - site-shell
  scene-state:
    owner: ethan
    depends_on:
      - site-shell
  window-state:
    owner: ethan
    depends_on:
      - site-shell
  content-bridge:
    owner: ethan
    depends_on:
      - command-bus
      - scene-state
elements:
  galaxy:
    owner: ethan
    depends_on:
      - scene-state
    layer: 0
  computer-foreground:
    owner: ethan
    depends_on:
      - galaxy
      - window-state
    layer: 1
  plush-character:
    owner: ethan
    depends_on:
      - galaxy
    layer: 2
features:
  scene-preview:
    owner: ethan
    depends_on:
      - scene-state
      - content-bridge
  window-lifecycle:
    owner: ethan
    depends_on:
      - command-bus
      - window-state
content:
  sections:
    - projects
    - ai-lab
    - trading-lab
    - about
    - articles
commands:
  scene:
    preview:
      owner: ethan
      input: section_id
      result: preview_state
      failure: invalid_section
  window:
    open:
      owner: ethan
      input: window_config
      result: window_id
      failure: creation_error
verification:
  commands:
    verify-all:
      - unit
      - e2e
      - contracts
      - content
      - build
