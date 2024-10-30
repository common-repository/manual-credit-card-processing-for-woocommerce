=== Manual Credit Card Processing for WooCommerce ===
Contributors: woodev
Tags: woocommerce, payment, manual, credit card, phone, offline, backend, orders
Requires at least: 4.0.1
Tested up to: 4.8
Stable tag: 1.6.1
License: GPLv3 or later
License URI: http://www.gnu.org/licenses/gpl-3.0.html

Our Manual Credit Card Processing for WooCommerce extension allows you to start taking payments fast and securely through the WooCommerce system.

== Description ==

# Manual Credit Card Processing for WooCommerce

This extension adds the ability to increase your sources of revenue.
Our Manual Credit Card Processing for WooCommerce extension allows you and/or your service representatives to start taking payments fast and securely through the WordPress / WooCommerce system.

Manual Credit Card Processing for WooCommerce will not effect your websites PCI Compliance and SAQ process. We take advantage of the existing payment gateways and shipping extensions that your website uses already, adding no extra risk. The forms and options available are provided by the currently activated plugins. We have found a way to tap into them for your convenience!

This plugin offers a handful of neat tricks under its shell, making phone orders possible and easier than ever. There are other plugins that perform the same tasks, but can be a hassle trying to get setup properly, stumble upon unwanted side effects or just don’t have a “Easy to Use” interface. This causes the PICNIC effect, making you wish you spent your money elsewhere. *cough*

## Built With

* [WordPress](https://wordpress.org/) - WordPress is open source software you can use to create a beautiful website, blog, or app.
* [WooCommerce](https://woocommerce.com/) - The most customizable eCommerce platform for building your online business.

## Benefits

* Earn more revenue
* Close sales fast, efficient and smooth
* Adds no extra work for PCI Compliance
* Build stronger relationships with your customers
* Works with Credit Card Payment Gateways
* Enables Storing Cards (if gateway allows)
* Quickly Correct Failed Orders
* Works with WooCommerce PRE v3
* Works with WooCommerce POST v3
* More to come…

## PRO Version

* Integrates Existing Shipping Methods
* Automatic Shipping Rate Calculation
* Converts Guests into Customers
* Quickly Replicate Previous Order (no subscriptions required)

== Installation ==

= From your WordPress dashboard =
1. Visit 'Plugins > Add New'
2. Search for 'Manual Credit Card Processing for WooCommerce'
3. Activate Manual Credit Card Processing for WooCommerce from your Plugins page. (You will be greeted with a Welcome page.)

= From WordPress.org =

1. Download Manual Credit Card Processing for WooCommerce.
2. Upload the 'Manual Credit Card Processing for WooCommerce' directory to your '/wp-content/plugins/' directory, using your favorite method (ftp, sftp, scp, etc...)
3. Activate Manual Credit Card Processing for WooCommerce from your Plugins page.

= Once Activated =

1. You can now go into your WooCommerce Orders
2. Click * Add Order *
3. Start using!

== Frequently Asked Questions ==

= Does this put your system at risk for PCI Compliance? =

Short answer is no, reason being we incorporate the existing checkout forms provided by the gateways themselves. Not using any custom forms that have to do with handling payment information.

= Does this work on WooCommerce 2.x =

Yes it does!

= Does this work on WooCommerce 3.x =

Yes it does!

== Screenshots ==

1. Logo for taking payments over the phone
2. Process payments with selected gateways
3. Quickly view and replicate orders for customer

== Changelog ==
= 1.6.1 =
* Naming convention change

= 1.6 =
* Updated conditional logic for checking if request is AJAX
* Added in wc_add_notice function (if not existing) to catch thrown exceptions

= 1.5 =
* Disabled button for collecting payment when order is "On Hold"

= 1.4 =
* Updated logic to prevent fatal errors when no shipping address has been provided.

= 1.3.1 =
* Prevent logic from trying to calculate totals for charging when a order has already been paid for

= 1.3 =
* Updated some logic for payment calculations to use new WC methods for getting $order->user_id

= 1.2.2 =
* Corrected assets path for scripts.js

= 1.2.1 =
* Removed unnecessary extra files

= 1.2 =
* Added in new feature to show progress when running payment

= 1.1 =
* Corrected logic for when to load assets

= 1.0 =
* Built out like a boss

== Upgrade Notice ==

= 1.5 =
* Disabled button for collecting payment when order is "On Hold"

= 1.4 =
* Updated logic to prevent fatal errors when no shipping address has been provided.

= 1.3.1 =
* Prevent logic from trying to calculate totals for charging when a order has already been paid for

= 1.3 =
* Updated some logic for payment calculations to use new WC, not deprecated

= 1.2.2 =
* Corrected assets path for scripts.js

= 1.2.1 =
Update to remove extra files

= 1.2 =
Updated functionality

= 1.1 =
Replaced core logic to be more OOP and limit where plugin assets load.

= 1.0 =
Initial Build
