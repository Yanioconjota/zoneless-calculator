# ZonelessCalculator

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.0.

## Key Concepts

### Zoneless Components

**Technical definition:** Zoneless components are Angular components that operate without Zone.js, a library traditionally used to automatically detect changes in the application. Instead, they rely on Angular's new signal-based reactivity system to explicitly notify the framework when the UI needs to update.

**Analogy for non-devs:** Imagine a restaurant kitchen with two different management styles:

- **Traditional (with Zone.js):** A manager constantly watches every single action in the kitchen — every time someone opens a fridge, chops a vegetable, or moves a pan. After any action, the manager checks if any dish needs to be sent out. This works, but the manager is exhausted from watching everything, even irrelevant actions.

- **Zoneless (with Signals):** Instead of a hovering manager, each chef has a bell. When their dish is ready, they ring the bell to notify the waiter. The kitchen only reacts when there's actually something new to serve. Less overhead, more efficient.

Zoneless applications are faster and more predictable because updates happen only when explicitly triggered, not after every possible action.

### Content Projection

**Technical definition:** Content projection (also known as transclusion) is a pattern where a parent component can insert custom content into designated slots (`<ng-content>`) inside a child component's template. This allows creating flexible, reusable wrapper components.

**Analogy for non-devs:** Think of content projection like a picture frame:

- The **frame** (child component) defines the structure, border, and style
- The **photo** (projected content) is whatever you choose to put inside
- The frame doesn't care if you insert a family photo, a painting, or a concert ticket — it just provides the container

Another analogy: A shipping box. The box manufacturer creates the box with a specific shape and material, but they don't decide what goes inside. You (the parent) choose what to pack. The box (child component) just provides the container with `<ng-content>` being the "open space" where your items go.

```html
<!-- Parent template -->
<app-card>
  <h2>My Custom Title</h2>
  <p>Any content I want here!</p>
</app-card>

<!-- Card component template -->
<div class="card-wrapper">
  <ng-content></ng-content>  <!-- The "open space" for your content -->
</div>
```

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
