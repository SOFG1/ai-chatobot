# Whitelabel Solutions for Customers

This folder contains the whitelabel solutions for our customers who have opted for custom branding. Each customer's
files are organized in the following directory structure:

## Structure

```
whitelabels/
└── /
├── theme-<customer>.css
└── logo-<customer>.png
```

### Details

For each customer, there are two files:
- `theme-<customer>.css`: The CSS theme specific to the customer's branding.
- `logo-<customer>.png`: The logo image file for the customer's branding. Can be `svg` or `jpg`. Need to be referenced inside the `theme.css`.

## Instructions

### 1. Design & Logo

Set the colors to match with the customer's CI and place it under `<customer>/theme-<customer>.css`.  
Ask the customer for their logo and place it under `<customer>/logo-<customer>.png`.

### 2. Generating Kubernetes ConfigMap

To create a Kubernetes ConfigMap that contains both the CSS and the logo file for a customer, you can use the following command.

Replace `$CUSTOMER` with the actual customer's name.

```bash
CUSTOMER=fom
kubectl create configmap whitelabel-${CUSTOMER} \
  --from-file=theme.css=${CUSTOMER}/theme-${CUSTOMER}.css \
  --from-file=logo.png=${CUSTOMER}/logo-${CUSTOMER}.svg \
  --dry-run=client -o yaml > ${CUSTOMER}/whitelabel-${CUSTOMER}.configmap.yaml
```