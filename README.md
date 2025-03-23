# GariusFormHandler

![Version](https://img.shields.io/badge/version-1.1.7-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg) ![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)

A lightweight, extensible AJAX form handler with customizable callbacks and validation support. Simplify form submissions with flexible response handling, optional loading states, and a foundation for future enhancements.

## Features
- **AJAX Support:** Handle JSON and Partial View responses asynchronously.
- **Validation:** Seamless integration with jQuery Validate and Unobtrusive Validation.
- **Customizable Callbacks:** Hooks for pre-send, success, and error handling.
- **Loading State Management:** Optional, user-defined visual feedback during submission.
- **Extensible:** Designed to grow with additional features and integrations.
- **Lightweight:** Minimal dependencies, easy to integrate into any project.

## Installation
### Download:
Clone or download this repository.
```bash
git clone https://github.com/garius-dev/garius-form-handler.git
```
### Choose a Version:
- `dist/garius-form-handler.js`: Full, readable version for development.
- `dist/garius-form-handler.min.js`: Minified version for production.

```html
<script src="path/to/dist/garius-form-handler.min.js"></script>
```

### Dependencies:
Include jQuery and validation libraries if using validation features.
```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.5/jquery.validate.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validation-unobtrusive/3.2.12/jquery.validate.unobtrusive.min.js"></script>
```

## Usage
Initialize `GariusFormHandler` with a form selector and optional configuration.

### Basic Example
Handle a simple JSON response:
```javascript
GariusFormHandler.init('form.my-form', {
    asyncResponse: true,
    onJsonResponse: (form, data) => console.log('Success:', data)
});
```

### With Loading State
Add visual feedback using the `is-loading` convention:
```javascript
GariusFormHandler.init('form.my-form', {
    asyncResponse: true,
    setLoadingState: (form) => form.classList.add('is-loading'),
    resetLoadingState: (form) => form.classList.remove('is-loading'),
    onJsonResponse: (form, data) => console.log('JSON response:', data)
});
```

#### Recommended CSS:
```css
form.is-loading {
    opacity: 0.9;
    position: relative;
}
form.is-loading button[type="submit"] {
    cursor: not-allowed;
    padding-right: 2rem;
    position: relative;
}
form.is-loading button[type="submit"]::after {
    content: '';
    position: absolute;
    width: 1rem;
    height: 1rem;
    top: 50%;
    right: 0.625rem;
    transform: translateY(-50%);
    border: 2px solid #666;
    border-top: 2px solid #333;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}
@keyframes spin {
    from { transform: translateY(-50%) rotate(0deg); }
    to { transform: translateY(-50%) rotate(360deg); }
}
```

### Advanced Example
Full customization with validation, headers, and error handling:
```javascript
GariusFormHandler.init('form.my-form', {
    asyncResponse: true,
    enableValidation: true,
    setLoadingState: (form) => {
        const btn = form.querySelector('button[type="submit"]');
        btn.dataset.originalText = btn.textContent;
        btn.textContent = 'Processing...';
        btn.classList.add('loading');
    },
    resetLoadingState: (form) => {
        const btn = form.querySelector('button[type="submit"]');
        btn.textContent = btn.dataset.originalText || 'Submit';
        btn.classList.remove('loading');
    },
    beforeSend: (form, formData, fetchOptions) => {
        fetchOptions.headers = { 'X-Custom-Header': 'value' };
        return formData.get('field') !== 'invalid'; // Cancel if invalid
    },
    onJsonResponse: (form, data) => console.log('JSON:', data),
    onPartialViewResponse: (form, html) => document.getElementById('result').innerHTML = html,
    onErrorResponse: (form, error) => console.error('Error:', error.message),
    notifier: {
        success: (msg) => alert(`Success: ${msg}`),
        error: (msg) => alert(`Error: ${msg}`),
        warning: (msg) => alert(`Warning: ${msg}`)
    }
});
```

## Configuration Options
| Option | Type | Default Value | Description |
|--------|------|--------------|-------------|
| asyncResponse | Boolean | false | Enable AJAX behavior (JSON/PartialView) instead of standard HTML/redirect. |
| enableValidation | Boolean | true | Enable client-side validation if jQuery validation is available. |
| resetOnSuccess | Boolean | true | Reset form on successful submission. |
| resetOnError | Boolean | true | Reset form on error. |
| notifier | Object | `{ success, error, warning }` | Custom notification handlers for success, error, and warning messages. |

## Callbacks
| Callback | Arguments | Description |
|----------|----------|-------------|
| beforeSend | (form, formData, fetchOptions) | Called before sending the request. Return false to cancel. |
| setLoadingState | (form) | Optional callback to apply loading state. |
| resetLoadingState | (form) | Optional callback to reset loading state. |
| onJsonResponse | (form, data) | Called on successful JSON response. |
| onPartialViewResponse | (form, html) | Called on successful Partial View response. |
| onErrorResponse | (form, error) | Called on error. |

## Project Structure
```
garius-form-handler/
├── src/                  # Source code
│   └── garius-form-handler.js
├── dist/                 # Distribution files
│   ├── garius-form-handler.js      # Full version
│   └── garius-form-handler.min.js  # Minified version
├── tests/                # Unit tests (future)
│   └── (placeholder)
├── LICENSE               # MIT License
└── README.md             # Documentation
```

## Building the Project
### Install dependencies:
```bash
npm install
```
### Run the build script:
```bash
npm run build
```

## Roadmap
- Add support for custom events (e.g., form:submitted, form:error).
- Integrate with modern frameworks (React, Vue) via adapters.
- Add unit tests in `tests/` using Jest or Mocha.
- Support file upload progress tracking.
- Provide TypeScript definitions.

## License
This project is licensed under the MIT License.

