```yaml
site_system:
  system_backbone:
    - id: static-site-generator
      type: framework
      version: "1.24.0"
      dependencies: []
      description: Core static site generator for building HTML files from markdown and templates
    - id: css-preprocessor
      type: tool
      version: "8.10.0"
      dependencies:
        - static-site-generator
      description: Preprocesses CSS with variables, nesting, and mixins
    - id: javascript-bundler
      type: tool
      version: "5.88.0"
      dependencies:
        - static-site-generator
      description: Bundles and minifies JavaScript modules

  visual_elements:
    - id: base-theme
      type: theme
      source: "github.com/themes/portfolio-essential"
      dependencies:
        - static-site-generator
        - css-preprocessor
      description: Minimal, responsive theme with customizable color palette
    - id: typography-system
      type: design-system
      source: "design/typography.yaml"
      dependencies:
        - base-theme
        - css-preprocessor
      description: Font hierarchy, spacing scale, and text rendering settings
    - id: icon-library
      type: asset-bundle
      source: "assets/icons/symbol-sprite.svg"
      dependencies:
        - static-site-generator
      description: SVG symbol sprite with common interface icons

  user_facing_features:
    - id: navigation-menu
      type: component
      source: "layouts/partials/nav.html"
      dependencies:
        - base-theme
        - icon-library
      description: Responsive hamburger menu with smooth transitions
    - id: contact-form
      type: interactive-component
      source: "layouts/partials/contact-form.html"
      dependencies:
        - base-theme
        - javascript-bundler
      description: Validated contact form with client-side feedback
    - id: project-gallery
      type: interactive-component
      source: "layouts/partials/gallery.html"
      dependencies:
        - base-theme
        - javascript-bundler
      description: Filterable portfolio grid with lightbox functionality

  content_sections:
    - id: hero-section
      type: content-block
      source: "content/hero.yaml"
      dependencies:
        - base-theme
        - typography-system
      description: Introduction area with name, title, and call-to-action
    - id: about-section
      type: content-block
      source: "content/about.md"
      dependencies:
        - base-theme
        - typography-system
      description: Personal biography with photo and key achievements
    - id: projects-section
      type: content-collection
      source: "content/projects/*.md"
      dependencies:
        - project-gallery
        - typography-system
      description: Portfolio of projects with descriptions, images, and links
    - id: skills-section
      type: content-block
      source: "content/skills.yaml"
      dependencies:
        - typography-system
        - icon-library
      description: Technical skills with proficiency indicators

  semantic_commands:
    - id: build-production
      owner: static-site-generator
      input:
        source_directory: "content/"
        output_directory: "public/"
      result: Optimized static site in public directory with minified assets
      failure: Exit code non-zero, build logs in stderr
      dependencies:
        - css-preprocessor
        - javascript-bundler
        - base-theme
    - id: optimize-images
      owner: javascript-bundler
      input:
        source_directory: "assets/images/"
        output_directory: "public/images/"
      result: Compressed, responsive images with WebP fallbacks
      failure: Exit code non-zero, unoptimized images remain in output
      dependencies:
        - static-site-generator
    - id: validate-content
      owner: static-site-generator
      input:
        content_directory: "content/"
        schema: "schemas/content-schema.json"
      result: Validation report with zero errors
      failure: Exit code non-zero, detailed validation errors
      dependencies:
        - static-site-generator

  verification_commands:
    - id: test-links
      owner: javascript-bundler
      input:
        target_directory: "public/"
        exclude_patterns: ["*.pdf"]
      result: HTML report of all links with status codes
      failure: Exit code non-zero, report contains broken links
      dependencies:
        - build-production
    - id: performance-audit
      owner: javascript-bundler
      input:
        target_url: "http://localhost:8080"
        lighthouse_config: "lighthouse.config.json"
      result: JSON report with performance metrics and scores
      failure: Exit code non-zero, performance scores below thresholds
      dependencies:
        - build-production
    - id: accessibility-check
      owner: javascript-bundler
      input:
        target_directory: "public/"
        wcag_level: "AA"
      result: Accessibility report with violation details
      failure: Exit code non-zero, critical accessibility issues found
      dependencies:
        - build-production
```
