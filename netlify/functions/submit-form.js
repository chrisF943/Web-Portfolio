exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    // Parse the JSON data from the request body
    const data = JSON.parse(event.body);

    // Get the Formspree form ID from the environment variable
    const formspreeUrl = `https://formspree.io/f/${process.env.FORMSPREE_FORM_ID}`;

    try {
        // Forward the form data to Formspree
        const response = await fetch(formspreeUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });

        // Check if the submission was successful
        if (response.ok) {
            return {
                statusCode: 200,
                body: 'Form submitted successfully!',
            };
        } else {
            return {
                statusCode: 500,
                body: 'Form submission failed.',
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: 'Internal Server Error',
        };
    }
};
