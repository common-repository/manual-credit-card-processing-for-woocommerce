<?php
class MWC_CCP_CustomerOrders {
    /**
     * Instance of Customer
     * @var null
     */
    protected static $_instance = null;

    /**
     * @return MWC_CCP_CustomerOrders|null
     */
    public static function instance() {
        if ( is_null( self::$_instance ) ) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * MWC_CCP_CustomerOrders constructor.
     */
    public function __construct() {
        if ( !session_id() ) {
            session_start();
        }

        add_action( 'add_meta_boxes_shop_order' , array($this, 'add_meta_boxes'), 30);
        add_action( 'wp_ajax_mc_wc_cc_manual_orders', array($this, 'mc_wc_cc_manual_orders_callback') );
    }

    /**
     * Add meta box to orders page
     */
    public function add_meta_boxes(){
        add_meta_box( 'woocommerce-order-manual-payment-previous-orders', __( 'Customer\'s Previous Orders', 'woocommerce' ), 'MWC_CCP_CustomerOrders::output', 'shop_order', 'normal', 'high' );
    }

    /**
     * Output the metabox.
     *  Data is populated later via AJAX
     */
    public static function output( $post ) {}


    /**
     *  AJAX Method for loading previous orders after customer has been selected
     */
    public static function mc_wc_cc_manual_orders_callback() {

        check_ajax_referer('moco_wc_cc_manual_payments', 'security');

        $return = array();
        $userId = (int)$_POST['user_id'];
        $customer_orders = get_posts( array(
            'numberposts' => -1,
            'meta_key'    => '_customer_user',
            'meta_value'  => $userId,
            'post_type'   => wc_get_order_types(),
            'post_status' => array(
                'wc-on-hold',
                'wc-completed',
                'wc-cancelled',
                'wc-refunded',
                'wc-failed',
            ),
        ) );

        $orders = array();
        $html = null;
        $html_start = <<<PREVO
<table class="wp-list-table widefat fixed striped posts">
	<thead>
	<tr>
	    <td>&nbsp;</td>
	    <td>Status</td>
	    <td>Shipping</td>
	    <td>Order Total</td>
	    <td>Items</td>
	    <td>Created</td>
	    <td>Paid</td>
	</tr>
	</thead>
	<tbody>
PREVO;
        $html_end = <<<POSTO
    </tbody>
    <tfoot>
        <tr>
            <td colspan="7" style="text-align:center; font-weight:bold">Did you know with the PRO version you could quickly re-order?</td>
        </tr>
    </tfoot>
</table>
POSTO;


        foreach($customer_orders as $order){
            
            $orderId = $order->ID;
            
            $orders[$orderId] = array(
                'id' => $orderId,
                'date_start' => $order->post_date,
                'date_modified' => $order->post_modified,
                'status' => $order->post_status,
                'total' => 0,
                'items' => array()
            );

            $order = new WC_Order($order->ID);
            $items = $order->get_items();
            $lineItems = array();
            foreach( $items as $product ) {
                $lineItems[] = $product->get_name() . ' x' . $product->get_quantity();
            }
            $shippingTotal = ($order->get_shipping_total() == '') ? 'N/A' : '$'.number_format($order->get_shipping_total(),2);
            $html .= '<tr>
        <td>
            <a href="post.php?post='.$orderId.'&action=edit" target="_blank">View</a>
        </td>
	    <td>'.ucwords($order->get_status()).'</td>
	    <td>'.$shippingTotal.'</td>
	    <td>$'.number_format($order->get_total(),2).'</td>
	    <td>'.implode('<br/>',$lineItems).'</td>
	    <td>'.date('m/d/Y',strtotime($order->get_date_created())).'</td>
	    <td>'.date('m/d/Y',strtotime($order->get_date_paid())).'</td>
</tr>';
        }

        $return['status'] = true;
        $return['orders'] = $orders;
        $return['html']   = $html_start . $html . $html_end;
        
        echo(json_encode($return));
        wp_die();
    }
}
