/**
 * Example Usage: Control-Flow Features
 * 
 * This file demonstrates how to use the new CONDITION and FOREACH nodes
 * in workflows. These are example patterns, not executable tests.
 */

// ============================================================================
// Example 1: CONDITION Node - Price Alert
// ============================================================================

/**
 * Workflow: Check if product price is below target, send alert if true
 * 
 * Nodes:
 * 1. NAVIGATE_URL (to product page)
 * 2. PAGE_TO_HTML
 * 3. EXTRACT_TEXT_FROM_ELEMENT (get price)
 * 4. CONDITION (check if price < $50)
 *    ├─ true → DELIVER_VIA_WEBHOOK (send "Buy now!" alert)
 *    └─ false → [end] (do nothing)
 */

const priceAlertWorkflow = {
    nodes: [
        {
            id: "1",
            type: "NAVIGATE_URL",
            inputs: { Url: "https://example.com/product" },
        },
        {
            id: "2",
            type: "PAGE_TO_HTML",
            dependencies: ["1"],
        },
        {
            id: "3",
            type: "EXTRACT_TEXT_FROM_ELEMENT",
            inputs: { Selector: ".price" },
            dependencies: ["2"],
        },
        {
            id: "4",
            type: "CONDITION",
            inputs: {
                "Left Value": "{3.extractedText}", // Output from node 3
                Operator: "LESS_THAN",
                "Right Value": "50",
            },
            dependencies: ["3"],
        },
        {
            id: "5",
            type: "DELIVER_VIA_WEBHOOK",
            inputs: {
                "Webhook Url": "https://webhook.site/...",
                Body: "Price alert: Product is now under $50!",
            },
            dependencies: ["4"],
            edgeConditions: {
                "4": "true", // Only run if CONDITION result is "true"
            },
        },
    ],
};

// ============================================================================
// Example 2: FOREACH Loop - Multi-Product Scraping
// ============================================================================

/**
 * Workflow: Scrape multiple product pages in parallel
 * 
 * Nodes:
 * 1. ADD_PROPERTY_TO_JSON (create URLs array)
 * 2. FOREACH (iterate over each URL)
 * 3. NAVIGATE_URL (use current item)
 * 4. PAGE_TO_HTML
 * 5. EXTRACT_TEXT_FROM_ELEMENT (get product name)
 * 6. DELIVER_VIA_WEBHOOK (send all results)
 */

const multiProductWorkflow = {
    nodes: [
        {
            id: "1",
            type: "ADD_PROPERTY_TO_JSON",
            inputs: {
                "Property Name": "urls",
                "Property Value": JSON.stringify([
                    "https://example.com/product1",
                    "https://example.com/product2",
                    "https://example.com/product3",
                ]),
            },
        },
        {
            id: "2",
            type: "FOREACH",
            inputs: {
                Items: "{1.output}", // JSON array from node 1
                "Item Variable": "currentUrl",
            },
            dependencies: ["1"],
        },
        // Note: Child nodes of FOREACH would be spawned dynamically
        // The actual iteration is handled by the scheduler
        {
            id: "3",
            type: "DELIVER_VIA_WEBHOOK",
            inputs: {
                "Webhook Url": "https://webhook.site/...",
                Body: "{2.results}", // Aggregated results from all iterations
            },
            dependencies: ["2"],
        },
    ],
};

// ============================================================================
// Example 3: Nested CONDITION - Stock & Price Check
// ============================================================================

/**
 * Workflow: Complex decision tree for product monitoring
 * 
 * Logic:
 * IF in stock:
 *   IF price < $50:
 *     Send "BUY NOW!" alert
 *   ELSE:
 *     Send "Wait for price drop" alert  
 * ELSE:
 *   Send "Out of stock" alert
 */

const complexDecisionWorkflow = {
    nodes: [
        {
            id: "1",
            type: "PAGE_TO_HTML",
            inputs: { Url: "https://example.com/product" },
        },
        {
            id: "2",
            type: "CONDITION",
            name: "Check Stock",
            inputs: {
                "Left Value": "{1.webPage}",
                Operator: "CONTAINS",
                "Right Value": "In Stock",
            },
            dependencies: ["1"],
        },
        // TRUE BRANCH: In Stock
        {
            id: "3",
            type: "EXTRACT_TEXT_FROM_ELEMENT",
            inputs: { Selector: ".price" },
            dependencies: ["2"],
            edgeConditions: { "2": "true" },
        },
        {
            id: "4",
            type: "CONDITION",
            name: "Check Price",
            inputs: {
                "Left Value": "{3.extractedText}",
                Operator: "LESS_THAN",
                "Right Value": "50",
            },
            dependencies: ["3"],
        },
        {
            id: "5",
            type: "DELIVER_VIA_WEBHOOK",
            inputs: {
                "Webhook Url": "https://webhook.site/...",
                Body: "🎉 BUY NOW! In stock and under $50!",
            },
            dependencies: ["4"],
            edgeConditions: { "4": "true" },
        },
        {
            id: "6",
            type: "DELIVER_VIA_WEBHOOK",
            inputs: {
                "Webhook Url": "https://webhook.site/...",
                Body: "⏰ Wait for price drop (currently over $50)",
            },
            dependencies: ["4"],
            edgeConditions: { "4": "false" },
        },
        // FALSE BRANCH: Out of Stock
        {
            id: "7",
            type: "DELIVER_VIA_WEBHOOK",
            inputs: {
                "Webhook Url": "https://webhook.site/...",
                Body: "❌ Out of stock - monitoring...",
            },
            dependencies: ["2"],
            edgeConditions: { "2": "false" },
        },
    ],
};

// ============================================================================
// Example 4: Parallel Execution - Multi-Site Comparison
// ============================================================================

/**
 * Workflow: Compare prices across multiple sites in parallel
 * 
 * Independent branches execute simultaneously for maximum speed
 */

const parallelComparisonWorkflow = {
    nodes: [
        {
            id: "1",
            type: "LAUNCH_BROWSER",
        },
        // Branch A: Site 1
        {
            id: "2a",
            type: "NAVIGATE_URL",
            inputs: { Url: "https://site1.com/product" },
            dependencies: ["1"],
        },
        {
            id: "3a",
            type: "EXTRACT_TEXT_FROM_ELEMENT",
            inputs: { Selector: ".price" },
            dependencies: ["2a"],
        },
        // Branch B: Site 2 (runs in parallel with Branch A)
        {
            id: "2b",
            type: "NAVIGATE_URL",
            inputs: { Url: "https://site2.com/product" },
            dependencies: ["1"],
        },
        {
            id: "3b",
            type: "EXTRACT_TEXT_FROM_ELEMENT",
            inputs: { Selector: ".price" },
            dependencies: ["2b"],
        },
        // Branch C: Site 3 (runs in parallel with A & B)
        {
            id: "2c",
            type: "NAVIGATE_URL",
            inputs: { Url: "https://site3.com/product" },
            dependencies: ["1"],
        },
        {
            id: "3c",
            type: "EXTRACT_TEXT_FROM_ELEMENT",
            inputs: { Selector: ".price" },
            dependencies: ["2c"],
        },
        // Aggregate results (waits for all branches)
        {
            id: "4",
            type: "DELIVER_VIA_WEBHOOK",
            inputs: {
                "Webhook Url": "https://webhook.site/...",
                Body: JSON.stringify({
                    site1: "{3a.extractedText}",
                    site2: "{3b.extractedText}",
                    site3: "{3c.extractedText}",
                }),
            },
            dependencies: ["3a", "3b", "3c"],
        },
    ],
};

// ============================================================================
// Testing the CONDITION Operators
// ============================================================================

const operatorExamples = {
    EQUALS: {
        "Left Value": "hello",
        Operator: "EQUALS",
        "Right Value": "hello", // → true
    },
    CONTAINS: {
        "Left Value": "hello world",
        Operator: "CONTAINS",
        "Right Value": "world", // → true
    },
    STARTS_WITH: {
        "Left Value": "https://example.com",
        Operator: "STARTS_WITH",
        "Right Value": "https://", // → true
    },
    IS_EMPTY: {
        "Left Value": "",
        Operator: "IS_EMPTY",
        "Right Value": "", // → true
    },
    GREATER_THAN: {
        "Left Value": "100",
        Operator: "GREATER_THAN",
        "Right Value": "50", // → true
    },
};

export {
    priceAlertWorkflow,
    multiProductWorkflow,
    complexDecisionWorkflow,
    parallelComparisonWorkflow,
    operatorExamples,
};
