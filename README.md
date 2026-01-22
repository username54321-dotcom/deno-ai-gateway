# Deno Get Reply

A robust, Deno-based API service that unifies multiple AI providers (Gemini, Groq, OpenRouter) into a single, easy-to-use interface. This project allows seamless text generation with automatic provider rotation and unified error handling.

## Features

- **Multi-Provider Support**: Integrate with Google Gemini, Groq, and OpenRouter.
- **Auto-Rotation**: Automatically rotates through available providers to ensure high availability and load balancing.
- **Unified API**: Send a single request format and get a standardized response, regardless of the underlying provider.
- **Secure Authentication**: key-based authentication middleware.
- **Request Validation**: Built-in validation for headers and body using Zod and Hono.
- **Built with Deno**: Leverages modern web standards and Deno's security features.

## Prerequisites

- [Deno](https://deno.land/) (latest version recommended) installed on your machine.
- API Keys for the providers you intend to use (Gemini, Groq, OpenRouter).
- A specialized `AUTH_KEY` for securing the API.

## Installation

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd Deno-Get-Reply
    ```

2.  **Environment Setup**
    create a `.env` file in the root directory (if not already present) and populate it with your keys:
    ```env
    AUTH_KEY=your_secure_32_char_auth_key
    GEMINI_API_KEY=your_gemini_key
    GROQ_API_KEY=your_groq_key
    OPENROUTER_API_KEY=your_openrouter_key
    ```

## Usage

### Running Request

Start the development server with hot-reloading:

```bash
deno task dev
```

The server will start on `http://localhost:8000` (or `http://0.0.0.0:8000`).

### API Endpoint

**POST /**

Generates a response using the specified or auto-selected AI provider.

#### Headers

| Key             | Value              | Description                        |
| :-------------- | :----------------- | :--------------------------------- |
| `Content-Type`  | `application/json` | Required                           |
| `Authorization` | `<YOUR_AUTH_KEY>`  | Must match the `AUTH_KEY` env var. |

#### Request Body

```json
{
  "prompt": "Explain Quantum Computing like I'm 5",
  "systemPrompt": "You are a helpful physics teacher.",
  "providor": "gemini",
  "reasoning": "medium"
}
```

| Field          | Type   | Required | Description                                                                                            |
| :------------- | :----- | :------- | :----------------------------------------------------------------------------------------------------- |
| `prompt`       | String | Yes      | The user input to generate a response for.                                                             |
| `systemPrompt` | String | No       | Instructions for the system behavior. (Default: "You Are A Helpful Ai Assistant")                      |
| `providor`     | String | No       | Explicitly select a provider: `"gemini"`, `"groq"`, `"openrouter"`. If omitted, auto-rotation is used. |
| `reasoning`    | String | No       | Reasoning effort level (e.g., `"medium"`). Supported by some providers.                                |

#### Response

**Success (200 OK)**

```json
{
  "auth": true,
  "providor": "gemini",
  "message": "Quantum computing is like...",
  "error": null
}
```

**Error (400/404/500)**

```json
{
  "auth": false, // or true
  "providor": null,
  "message": null,
  "error": "Error Generating Response."
}
```

## Project Structure

- `main.ts`: Application entry point and route handling.
- `clients/`: API client configurations for different providers.
- `data/`: Static data and templates (e.g., response templates, provider lists).
- `utils/`: Utility functions (e.g., provider rotation logic).
- `validations/`: Zod schemas for request validation.

## License

MIT
