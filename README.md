<h1>Payments API</h1>

<p>This API allows users to initiate payments using Stripe or PayPal, and receive webhook events for payment updates.</p>

<h2>/auth/register</h2>

<p>This route is used to register a new user.</p>

<h4>Method</h4>

<p><code>POST</code></p>

<h4>Data Params</h4>

<ul>
	<li><code>full_name</code>: Full name of the user (<span style="color:#e74c3c">required</span>)</li>
	<li><code>email_address</code>: Email address of the user (<span style="color:#e74c3c">required</span>)</li>
	<li><code>password</code>: Password for the user (<span style="color:#e74c3c">required</span>)</li>
	<li><code>confirm_password</code>: Confirm password for the user (<span style="color:#e74c3c">required</span>)</li>
</ul>

<h4>Request Example :&nbsp;</h4>

<blockquote>
<p><code>{ &quot;full_name&quot;: &quot;John Doe&quot;, &quot;email_address&quot;: &quot;john@example.com&quot;, &quot;password&quot;: &quot;abc123&quot;, &quot;confirm_password&quot;: &quot;abc123&quot; }</code></p>
</blockquote>

<h4>Response&nbsp;Example</h4>

<blockquote>
<p><code>{ &quot;message&quot;: &quot;success&quot; } </code></p>
</blockquote>

<h2>/auth/login</h2>

<p>This route is used to login an existing user.</p>

<h4>Method</h4>

<p><code>POST</code></p>

<h4>Data Params</h4>

<ul>
	<li><code>email</code>: Email address of the user (<span style="color:#e74c3c">required</span>)</li>
	<li><code>password</code>: Password for the user (<span style="color:#e74c3c">required</span>)</li>
</ul>

<h4>Request Example :&nbsp;</h4>

<blockquote>
<p><code>{ &quot;email_address&quot;: &quot;john@example.com&quot;, &quot;password&quot;: &quot;password&quot; }</code></p>
</blockquote>

<h4>Response&nbsp;Example</h4>

<blockquote>
<p><code>{ &quot;token&quot;: &quot;abcd1234&quot; }</code></p>
</blockquote>

<p>&nbsp;</p>


<h2>/payments/stripe/new</h2>

<p>This route is used to initiate a new Stripe payment.</p>

<p>This route requires authentication.</p>

<h4>Method</h4>

<p><code>POST</code></p>

<h4>Headers</h4>

<ul>
	<li><code>Authorization</code>: Token for authentication</li>
</ul>

<h4>Data Params</h4>

<ul>
	<li><code>amount</code>: Amount of the payment, in integer form (<span style="color:#e74c3c">required</span>)</li>
</ul>

<h4>Request Example :&nbsp;</h4>

<blockquote>
<p><code>{ &quot;amount&quot;: 500 }</code></p>
</blockquote>

<h4>Response&nbsp;Example</h4>

<h4>&nbsp;</h4>

<blockquote>
<p><code>{ &quot;checkout_url&quot;: &quot;https://checkout.stripe.com/abc123&quot; } </code></p>
</blockquote>

<h2>/payments/paypal/new</h2>

<p>This route is used to initiate a new PayPal payment.</p>

<p>This route requires authentication.</p>

<h4>Method</h4>

<p><code>POST</code></p>

<h4>Headers</h4>

<ul>
	<li><code>Authorization</code>: Token for authentication</li>
</ul>

<h4>Data Params</h4>

<ul>
	<li><code>amount</code>: Amount of the payment, in integer form (<span style="color:#e74c3c">required</span>)</li>
</ul>

<h4>Request Example :&nbsp;</h4>

<blockquote>
<p><code>{ &quot;amount&quot;: 500 }</code></p>
</blockquote>

<h4>Response&nbsp;Example</h4>

<blockquote>
<p><code>{ &quot;checkout_url&quot;: &quot;https://www.paypal.com/checkout/abc123&quot; }</code></p>
</blockquote>

<h4>&nbsp;</h4>
<h2>/payments/stripe/webhook</h2>

<p>This route is used to receive events from Stripe about a payment initiated, and updates the order status in the database accordingly.</p>

<h4>&nbsp;</h4>

<h2>/payments/paypal/return</h2>

<p>This route is used to validate PayPal payments after returning from the checkout URL. If the URL contains a <code>cancel</code> param equal to <code>true</code>, it sets the order in the database as canceled.</p>


<h4>&nbsp;</h4>

<ul>
</ul>
