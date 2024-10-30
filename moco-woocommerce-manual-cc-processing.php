<?php
/**
 * Plugin Name: Manual Credit Card Processing for WooCommerce
 * Plugin URI: https://woodev.us/product/woocommerce-manual-credit-card-processing/
 * Description: Manual Credit Card Processing for WooCommerce adds the ability to increase your sources of revenue. Our Manual Credit Card Processing for WooCommerce extension allows you and/or your service representatives to start taking payments fast and securely through the WordPress / WooCommerce system.
 * Author: WooDev
 * Author URI: https://woodev.us/
 * Version: 1.6.1
 *
 * Copyright: © 2007-2017 Morrison Consulting, LLC.
 * License: GNU General Public License v3.0
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

if( ! class_exists( 'MoCoManualPayments' )) {

    final class MoCoManualPayments {

        /**
         * Plugin Version
         * @var string
         */
        public $version = '1.6.1';

        /**
         * Extension Instance
         * @var null
         */
        protected static $_instance = null;

        /**
         * Customer instance.
         *
         * @var MWC_CC_Processing
         */
        public $_processor = null;

        /**
         * Customer instance.
         *
         * @var MWC_CCP_CustomerOrders
         */
        public $_customers = null;

        /**
         * MoCoManualPayments constructor.
         */
        public function __construct(){
            $this->includes();
            $this->init_hooks();
        }

        /**
         * @return MoCoManualPayments|null
         */
        public static function instance(){
            if( is_null(self::$_instance )){
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        /**
         * Conditionally Load Extension Core Assets
         */
        public function includes(){
            if (self::moco_wcc_mcc_can_start() && self::moco_wc_mcc_custom_is_plugin_active('woocommerce/woocommerce.php')) {
                require_once(__DIR__ . '/classes/MWC_CC_Processing.php');
                require_once(__DIR__ . '/classes/MWC_CCP_CustomerOrders.php');
                require_once(__DIR__ . '/../woocommerce/includes/class-wc-frontend-scripts.php');
            }
        }

        /**
         * Add link to Plugins page to quickly let user go pro
         * @param $links
         * @return mixed
         */
        public function plugin_add_pro_link($links ) {
            $settings_link = '<strong><a href="https://woodev.us/product/woocommerce-manual-credit-card-processing/" target="_blank" title="Go pro to unlock new features!">' . __( 'Go Pro!' ) . '</a></strong>';
            array_push( $links, $settings_link );
            return $links;
        }

        /**
         * Initiate Instances or Prompt Admin
         */
        public function init_moco_wc_mcc() {
            if (self::moco_wcc_mcc_can_start()) {
                if (self::moco_wc_mcc_custom_is_plugin_active('woocommerce/woocommerce.php')) {
                    $this->_processor = $this->processor();
                    $this->_customers = $this->customer();
                } else {
                    add_action('admin_notices', array( self::$_instance, 'moco_wc_mcc_require_woo' ));
                }
            }
        }

        /**
         * Helper to check for active plugins
         * @param $plugin
         * @return bool
         */
        public static function moco_wc_mcc_custom_is_plugin_active($plugin) {
            return in_array($plugin, (array) get_option('active_plugins', array()));
        }

        /**
         * Check current page to see if we should include the extension and assets
         * @return bool
         */
        public static function moco_wcc_mcc_can_start() {
            global $pagenow;
            switch ($pagenow) {
                case 'admin-ajax.php':
                    if($_POST && defined( 'DOING_AJAX' ) && !empty($_POST['action'])){
                        $moco_wcc_mcc_ajax_action = array(  'mc_wc_cc_manual',
                                                            'mc_wc_calculate_shipping',
                                                            'mc_wc_set_shipping',
                                                            'mc_wc_cc_manual_orders',
                                                            'mc_wc_cc_manual_reorder',
                                                            'woocommerce_save_order_items',
                                                            'woocommerce_calc_line_taxes');
                        return (in_array($_POST['action'],$moco_wcc_mcc_ajax_action));
                    }else{
                        return false;
                    }
                    break;
                case 'post-new.php':
                    return ($_GET['post_type'] == 'shop_order');
                    break;
                case 'post.php':
                    $type = get_post_type($_GET['post']);
                    $ajax = (isset($_GET['wc-ajax']) && $_GET['wc-ajax'] == 'get_refreshed_fragments' );
                    return ($type == 'shop_order' && !$ajax);
                    break;
                case 'edit.php':
                    if ($_GET && !empty($_GET['wc-ajax'])) {
                        return false;
                    }
                    return (!empty($_GET['post_type']) && $_GET['post_type'] == 'shop_order');
                    break;
                default:
                    return false;
                    break;
            }
        }

        /**
         * Hook into WordPress and WooCommerce
         */
        private function init_hooks(){
            $plugin = plugin_basename( __FILE__ );
            add_action('admin_init', array( $this, 'init_moco_wc_mcc' ));
            add_filter( "plugin_action_links_$plugin", array( $this, 'plugin_add_pro_link' ) );
        }

        /**
         *  Display Admin Error for missing required WooCommerce plugin
         */
        private function moco_wc_mcc_require_woo() {
            ?>
            <div class="notice notice-warning is-dismissible">
                <p>
                    <strong><?php _e('Manual CC Processing', 'moco'); ?>
                        :</strong> <?php _e('WooCommerce is required for this plugin to work as expected. Any credit card gateways would be recommended as well, otherwise there will be no gateways available to charge with.', 'moco'); ?>
                </p>
            </div>
            <?php
        }

        /**
         * @return MWC_CC_Processing|null
         */
        public function processor(){
            return MWC_CC_Processing::instance();
        }

        /**
         * @return MWC_CCP_CustomerOrders|null
         */
        public function customer(){
            return MWC_CCP_CustomerOrders::instance();
        }
    }
}

function MoCo_WC_MCC(){
    return MoCoManualPayments::instance();
}
$GLOBALS['moco_wc_mcc'] = MoCo_WC_MCC();


function moco_wc_pro_admin_notice() {
    $installed = get_option( 'moco_wc_mcc_installed' );
    if(!$installed){
        $installed =  date('U');
        update_option( 'moco_wc_mcc_installed', $installed, false );
    }
    $timeToNag = date('Y-m-d', strtotime('+5 days', $installed));
    if($timeToNag <= date('Y-m-d')) {
        ?>
        <div class="notice notice-info is-dismissible">
            <p><?php _e('Looks like you have been using the Manual Credit Card Processing for WooCommerce for awhile now.', 'moco'); ?></p>
            <p>
                <?php _e('Have you thought about going pro to unlock new features that will improve your workflow?', 'moco'); ?>
                <br><strong>PRO Features Include:</strong> Guest to Customer Conversion, Loading Previous Customer Orders, Quickly replicate past orders and more..
            </p>
            <p>
                <a href="https://woodev.us/product/woocommerce-manual-credit-card-processing/" alt="Click here to go pro now!" target="_blank">Click here to go pro now!</a>
            </p>
        </div>
        <?php
    }
}
add_action( 'admin_notices', 'moco_wc_pro_admin_notice' );
