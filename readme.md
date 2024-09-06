# Meldr

**Meldr** is a powerful static site generator that transforms Markdown files into HTML. It offers a streamlined workflow for creating static websites, with features designed to enhance productivity and flexibility.

## Features

- **Markdown-Centric**: Use Markdown as the primary language for content creation.
- **Static Site Generation**: Quickly generate a complete static site from your Markdown files.
- **Easy Initialization**: Start a new project with a single command.
- **Markdown to HTML Conversion**: Convert Markdown files to HTML using customizable templates.
- **Customizable Templates**: Use your own HTML templates to control the look and feel of your generated site.
- **Dynamic Content Linking and Injection**: 
  - `$link`: Automatically create links to other Markdown files or external sites.
  - `$insert`: Inject content from other Markdown files, rendered as HTML.
- **Development Server**: Build, serve, and watch your Markdown files for changes during development.

## Getting Started

### Installation

To install `Meldr`, you will eventually be able to run:

```bash
npm install -g meldr
```

### Basic Usage

1. **Create a new project**:
   ```bash
   meldr new
   ```

2. **Build your static site**:
   ```bash
   meldr build
   ```

3. **Serve your site locally and watch for changes**:
   ```bash
   meldr serve
   ```

## Special Syntax

Meldr introduces special syntax to enhance your Markdown files:

- `$insert`: Use this to insert content from another Markdown file. The inserted content will be rendered as HTML.
- `$link`: Use this to create links to other Markdown files or external sites. Meldr will automatically generate the appropriate HTML links.

## Commands

- `meldr new`: Initialize a new Meldr project.
- `meldr build`: Generate the static site by converting Markdown to HTML.
- `meldr serve`: Build the site, serve it locally, and watch Markdown files for changes.

## Contributing

We welcome contributions to Meldr! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

## License

[MIT License](LICENSE)

---

For more information, please visit our [official documentation](#).
