# Security policy

## Supported versions

Security fixes go into the latest release.

| Version | Supported |
|---|---|
| Latest 0.x | Yes |
| Older | No |

## Reporting a vulnerability

Please do not open a public issue for security problems.

Use GitHub's private reporting: open the **Security** tab of this repository and choose **Report a vulnerability**. Include the browser and version, a minimal HTML example that shows the problem, and what an attacker could do.

You can expect a first reply within a few days. Once a fix is released, the report is credited unless you prefer to stay anonymous.

## Scope

flow-datepicker renders all text (labels, presets, month and day names) as text, never as HTML. Reports about cross-site scripting through any option, attribute or locale string are in scope.
