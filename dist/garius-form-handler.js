/**
 * GariusFormHandler - A lightweight AJAX form handler with customizable callbacks and validation support.
 * Requires jQuery, jquery.validate, and jquery.validate.unobtrusive for client-side validation.
 * @version 1.1.7
 * @author George Lucas Oliveira de Souza
 */
const GariusFormHandler = {
    defaults: {
        asyncResponse: false,          // Enable AJAX behavior (JSON/PartialView) instead of standard HTML/redirect
        enableValidation: true,       // Enable client-side validation if jQuery validation is available
        onJsonResponse: null,         // Callback for JSON response
        onPartialViewResponse: null,  // Callback for Partial View (HTML) response
        onErrorResponse: null,        // Callback for error response
        beforeSend: null,             // Callback before sending the request, can return false to cancel
        setLoadingState: null,        // Optional callback to apply loading state
        resetLoadingState: null,      // Optional callback to reset loading state
        resetOnSuccess: true,         // Reset form on successful submission
        resetOnError: true,           // Reset form on error
        notifier: {                   // Notification handlers
            success: (message) => alert(message),
            error: (message) => alert(message),
            warning: (message) => alert(message),
        }
    },

    init(selector, options) {
        if (!selector || typeof selector !== 'string' || selector.trim() === '') {
            throw new Error('A valid non-empty selector is required.');
        }

        const config = { ...this.defaults, ...options };

        // Setup forms after DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            const forms = document.querySelectorAll(selector);
            if (forms.length === 0) {
                console.warn(`The selector "${selector}" does not match any element.`);
            }
            forms.forEach(form => this.setupForm(form, config));
        });
    },

    setupForm(form, config) {
        let isSubmitting = false;  // Prevent multiple submissions
        let wasSuccessful = false; // Track submission success

        form.addEventListener('submit', async (e) => {
            if (isSubmitting) {
                e.preventDefault();
                console.warn("Submission already in progress... ignoring duplicate click.");
                return;
            }

            e.stopPropagation();
            e.stopImmediatePropagation();

            const $form = $(form);

            // Validate form if enabled
            if (config.enableValidation) {
                if (typeof $.validator !== "undefined" && $form.validate) {
                    if (!$form.data('validator')) {
                        $.validator.unobtrusive.parse($form);
                    }
                    if (!$form.valid()) {
                        e.preventDefault();
                        return false;
                    }
                } else {
                    console.warn("jQuery Validation not found. Validation skipped.");
                }
            }

            isSubmitting = true;

            // Apply loading state if provided
            if (config.setLoadingState && typeof config.setLoadingState === 'function') {
                config.setLoadingState(form);
            }

            // Skip AJAX if not enabled or no response callbacks are provided
            if (!config.asyncResponse ||
                (config.asyncResponse && config.onJsonResponse === null && config.onPartialViewResponse === null)) {
                return;
            }

            e.preventDefault();

            const originalUrl = form.action;
            const method = form.method || 'POST';
            const formData = new FormData(form);
            const fetchOptions = { method, body: formData, redirect: 'manual' };

            // Execute beforeSend callback if provided
            if (config.beforeSend && typeof config.beforeSend === 'function') {
                const shouldProceed = config.beforeSend(form, formData, fetchOptions);
                if (shouldProceed === false) {
                    if (config.resetLoadingState && typeof config.resetLoadingState === 'function') {
                        config.resetLoadingState(form);
                    }
                    return;
                }
            }

            try {
                const response = await fetch(originalUrl, fetchOptions);

                if (!response.ok) {
                    throw new Error(`Something went wrong.`);
                }

                const contentType = response.headers.get('Content-Type');
                const isPartialView = response.headers.get('X-Partial-View') === 'true';

                if (contentType && contentType.includes('application/json')) {
                    if (typeof config.onJsonResponse === 'function') {
                        const data = await response.json();
                        config.onJsonResponse(form, data);
                    }
                    wasSuccessful = true;
                } else if (contentType && contentType.includes('text/html') && isPartialView) {
                    if (typeof config.onPartialViewResponse === 'function') {
                        const html = await response.text();
                        config.onPartialViewResponse(form, html);
                    }
                    wasSuccessful = true;
                } else {
                    wasSuccessful = true;
                    config.notifier.warning('No valid callback detected. Ensure your response type matches the expected async handling!.');
                }
            } catch (error) {
                wasSuccessful = false;
                if (typeof config.onErrorResponse === 'function') {
                    config.onErrorResponse(form, error);
                } else {
                    config.notifier.error(error.message);
                }
            } finally {
                isSubmitting = false;
                // Reset loading state if provided
                if (config.resetLoadingState && typeof config.resetLoadingState === 'function') {
                    config.resetLoadingState(form);
                }
                // Reset form based on outcome and config
                if (wasSuccessful && config.resetOnSuccess) form.reset();
                else if (!wasSuccessful && config.resetOnError) form.reset();
            }
        });
    },
};