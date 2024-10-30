var poOpen = true, tPayment = false, customerFound = false, formInit = false;

(function ( $ ) {
    $(document).ready(function(){
        if($( '#customer_user' ).length) {
            formInit = $('#post').serialize();
            setInterval(function () {
                assignButtonActions($);
                monitorCustomerAccount($);
            }, 2000);
        }
    });
}(jQuery));

function assignButtonActions( $ ){

    var calcButton = $('.calculate-action'),
        shipButton = $('.calculate-shipping-button'),
        payButton  = $('.collect-payment-button'),
        quickSave  = $('.quick-save-button');

    if(payButton.length && calcButton.index() > shipButton.index()) {

        payButton.unbind('click').on('click', function () {
            var cartTotal = $('.wc-order-totals:last .woocommerce-Price-amount:last');
            if(cartTotal.text().trim() == '$0.00'){
                alert('Nothing to pay for yet!');
                return false;
            }

            $(this).WCBackboneModal({
                template: 'wc-modal-mc-payment'
            });

            var paymentMethod = $('input[name="payment_method"]'),
                creditCardForm = $('#manual_cc_submit');

            $('.manual-total').html('<center>'+cartTotal.parent().html()+'</center>');

            if(paymentMethod.length == 1){
                paymentMethod.prop('checked',true);
                $('#cc-form-' + paymentMethod.val()).slideDown('fast');
                poOpen = true;
                creditCardForm.fadeIn('fast');
            }
            paymentMethod.on('change', function (e) {
                var co = $(this);
                if (poOpen) {
                    $('.payment_form').slideUp('fast', function () {
                        if (co.prop('checked')) {
                            $('#cc-form-' + co.val()).slideDown('fast');
                            $('#manual_cc_submit').fadeIn('fast');
                        }
                    });
                } else {
                    if (co.prop('checked')) {
                        $('#cc-form-' + co.val()).slideDown('fast');
                        poOpen = true;
                        $('#manual_cc_submit').fadeIn('fast');
                    }
                }
            });

            creditCardForm.on('click', function (e) {

                if (tPayment) {
                    alert('Currently attempting to charge card, please be patient.');
                } else {
                    var conf = confirm('Are you sure you want to process this charge?' + "\n\n" + 'This will charge the customer and email them order confirmation (if emails are enabled).');

                    if (conf) {
                        tPayment = true;
                        var gatewayId = $('[name="payment_method"]:checked').val(),
                            data = {
                                action: 'mc_wc_cc_manual',
                                order: $('#post_ID').val(),
                                gateway: gatewayId,
                                number: $('#' + gatewayId + '-card-number').val(),
                                expiry: $('#' + gatewayId + '-card-expiry').val(),
                                cvc: $('#' + gatewayId + '-card-cvc').val(),
                                data: $('#cc-form-' + gatewayId + ' input, #cc-form-' + gatewayId + ' select').serialize(),
                                security: moco_wc_cc.ajax_nonce
                            };
                        $('#manual_cc_submit').text('Processing...').addClass('disabled');
                        $('#charge_spinner').css('visibility','visible');
                        $.post(ajaxurl, data, function (response) {
                            try {
                                response = JSON.parse(response);
                            } catch (e) {
                            }
                            if (response.status) {
                                location.reload();
                            } else {
                                $('#manual_cc_submit').text('Charge Card').removeClass('disabled');
                                $('#charge_spinner').css('visibility','hidden');
                                alert(response.message);
                                tPayment = false;
                            }
                        }).fail(function(){
                            alert('Something went wrong!');
                        }).always(function(){
                            tPayment = false;
                        });
                    }
                }
            });
        });

        shipButton.unbind('click').on('click', function () {
            $('.calculate-shipping-button').WCBackboneModal({
                template: 'wc-modal-mc-shipping'
            });
        });
    }
}

function monitorCustomerAccount( $ ){
    var user_id = $( '#customer_user' ).val();
    if( user_id.trim() == '' || user_id === customerFound){
        return;
    }

    if( !customerFound || user_id !== customerFound) {
            var ordersMetaBox = $('#woocommerce-order-manual-payment-previous-orders');
            ordersMetaBox.slideUp('fast',function(){
                $(this).find('div.inside').html('');
            });
            customerFound = user_id;
            loadCustomerOrders($, user_id);
    }
    if( customerFound ){
        return;
    }
    customerFound = user_id;
}

function loadCustomerOrders($, user_id){
    var data = {
        action: 'mc_wc_cc_manual_orders',
        user_id: user_id,
        security: moco_wc_cc.ajax_nonce
    };
    $.post(moco_wc_cc.ajaxurl, data, function (r) {
        try{
            r = JSON.parse(r);
        }catch(e){
            console.warn('Data that came back is not in JSON format');
        }
        var ordersMetaBox = $('#woocommerce-order-manual-payment-previous-orders');
        ordersMetaBox.find('div.inside').html(r.html);
        ordersMetaBox.slideDown('fast');
    });
}


/*
 WooCommerce SkyVerge Payment Gateway Framework Payment Form CoffeeScript
 Version 4.3.0-beta

 Copyright (c) 2014-2016, SkyVerge, Inc.
 Licensed under the GNU General Public License v3.0
 http://www.gnu.org/licenses/gpl-3.0.html
 */

(function() {
    jQuery(document).ready(function($) {
        "use strict";
        return window.SV_WC_Payment_Form_Handler = (function() {
            function SV_WC_Payment_Form_Handler(args) {
                this.id = args.id;
                this.id_dasherized = args.id_dasherized;
                this.plugin_id = args.plugin_id;
                this.type = args.type;
                this.csc_required = args.csc_required;
                if ($('form.checkout').length) {
                    this.form = $('form.checkout');
                    this.handle_checkout_page();
                } else if ($('form#order_review').length) {
                    this.form = $('form#order_review');
                    this.handle_pay_page();
                } else if ($('form#add_payment_method').length) {
                    this.form = $('form#add_payment_method');
                    this.handle_add_payment_method_page();
                } else {
                    console.log('No payment form found!');
                    return;
                }
                this.params = window["sv_wc_payment_gateway_payment_form_params"];
                if (this.type === 'echeck') {
                    this.form.on('click', '.js-sv-wc-payment-gateway-echeck-form-check-hint, .js-sv-wc-payment-gateway-echeck-form-sample-check', (function(_this) {
                        return function() {
                            return _this.handle_sample_check_hint();
                        };
                    })(this));
                }
                $(document).trigger('sv_wc_payment_form_handler_init', {
                    id: this.id,
                    instance: this
                });
            }

            SV_WC_Payment_Form_Handler.prototype.handle_checkout_page = function() {
                if (this.type === 'credit-card') {
                    $(document.body).on('updated_checkout', (function(_this) {
                        return function() {
                            return _this.format_credit_card_inputs();
                        };
                    })(this));
                }
                $(document.body).on('updated_checkout', (function(_this) {
                    return function() {
                        return _this.set_payment_fields();
                    };
                })(this));
                $(document.body).on('updated_checkout', (function(_this) {
                    return function() {
                        return _this.handle_saved_payment_methods();
                    };
                })(this));
                return this.form.on("checkout_place_order_" + this.id, (function(_this) {
                    return function() {
                        return _this.validate_payment_data();
                    };
                })(this));
            };

            SV_WC_Payment_Form_Handler.prototype.handle_pay_page = function() {
                this.set_payment_fields();
                if (this.type === 'credit-card') {
                    this.format_credit_card_inputs();
                }
                this.handle_saved_payment_methods();
                return this.form.submit((function(_this) {
                    return function() {
                        if ($('#order_review input[name=payment_method]:checked').val() === _this.id) {
                            return _this.validate_payment_data();
                        }
                    };
                })(this));
            };

            SV_WC_Payment_Form_Handler.prototype.handle_add_payment_method_page = function() {
                this.set_payment_fields();
                if (this.type === 'credit-card') {
                    this.format_credit_card_inputs();
                }
                return this.form.submit((function(_this) {
                    return function() {
                        if ($('#add_payment_method input[name=payment_method]:checked').val() === _this.id) {
                            return _this.validate_payment_data();
                        }
                    };
                })(this));
            };

            SV_WC_Payment_Form_Handler.prototype.set_payment_fields = function() {
                return this.payment_fields = $(".payment_method_" + this.id);
            };

            SV_WC_Payment_Form_Handler.prototype.validate_payment_data = function() {
                var handler, valid;
                if (this.form.is('.processing')) {
                    return false;
                }
                this.saved_payment_method_selected = this.payment_fields.find('.js-sv-wc-payment-gateway-payment-token:checked').val();
                valid = this.type === 'credit-card' ? this.validate_card_data() : this.validate_account_data();
                handler = $(document.body).triggerHandler('sv_wc_payment_form_valid_payment_data', {
                        payment_form: this,
                        passed_validation: valid
                    }) !== false;
                return valid && handler;
            };

            SV_WC_Payment_Form_Handler.prototype.format_credit_card_inputs = function() {
                $('.js-sv-wc-payment-gateway-credit-card-form-account-number').payment('formatCardNumber').change();
                $('.js-sv-wc-payment-gateway-credit-card-form-expiry').payment('formatCardExpiry').change();
                $('.js-sv-wc-payment-gateway-credit-card-form-csc').payment('formatCardCVC').change();
                return $('.js-sv-wc-payment-gateway-credit-card-form-input').on('change paste keyup', (function(_this) {
                    return function() {
                        return _this.do_inline_credit_card_validation();
                    };
                })(this));
            };

            SV_WC_Payment_Form_Handler.prototype.do_inline_credit_card_validation = function() {
                var $csc, $expiry;
                $expiry = $('.js-sv-wc-payment-gateway-credit-card-form-expiry');
                $csc = $('.js-sv-wc-payment-gateway-credit-card-form-csc');
                if ($.payment.validateCardExpiry($expiry.payment('cardExpiryVal'))) {
                    $expiry.addClass('identified');
                } else {
                    $expiry.removeClass('identified');
                }
                if ($.payment.validateCardCVC($csc.val())) {
                    return $csc.addClass('identified');
                } else {
                    return $csc.removeClass('identified');
                }
            };

            SV_WC_Payment_Form_Handler.prototype.validate_card_data = function() {
                var account_number, csc, errors, expiry;
                errors = [];
                csc = this.payment_fields.find('.js-sv-wc-payment-gateway-credit-card-form-csc').val();
                if (csc != null) {
                    if (!csc) {
                        errors.push(this.params.cvv_missing);
                    } else {
                        if (/\D/.test(csc)) {
                            errors.push(this.params.cvv_digits_invalid);
                        }
                        if (csc.length < 3 || csc.length > 4) {
                            errors.push(this.params.cvv_length_invalid);
                        }
                    }
                }
                if (!this.saved_payment_method_selected) {
                    account_number = this.payment_fields.find('.js-sv-wc-payment-gateway-credit-card-form-account-number').val();
                    expiry = $.payment.cardExpiryVal(this.payment_fields.find('.js-sv-wc-payment-gateway-credit-card-form-expiry').val());
                    account_number = account_number.replace(/-|\s/g, '');
                    if (!account_number) {
                        errors.push(this.params.card_number_missing);
                    } else {
                        if (account_number.length < 12 || account_number.length > 19) {
                            errors.push(this.params.card_number_length_invalid);
                        }
                        if (/\D/.test(account_number)) {
                            errors.push(this.params.card_number_digits_invalid);
                        }
                        if (!$.payment.validateCardNumber(account_number)) {
                            errors.push(this.params.card_number_invalid);
                        }
                    }
                    if (!$.payment.validateCardExpiry(expiry)) {
                        errors.push(this.params.card_exp_date_invalid);
                    }
                }
                if (errors.length > 0) {
                    this.render_errors(errors);
                    return false;
                } else {
                    this.payment_fields.find('.js-sv-wc-payment-gateway-credit-card-form-account-number').val(account_number);
                    return true;
                }
            };

            SV_WC_Payment_Form_Handler.prototype.validate_account_data = function() {
                var account_number, errors, routing_number;
                if (this.saved_payment_method_selected) {
                    return true;
                }
                errors = [];
                routing_number = this.payment_fields.find('.js-sv-wc-payment-gateway-echeck-form-routing-number').val();
                account_number = this.payment_fields.find('.js-sv-wc-payment-gateway-echeck-form-account-number').val();
                if (!routing_number) {
                    errors.push(this.params.routing_number_missing);
                } else {
                    if (9 !== routing_number.length) {
                        errors.push(this.params.routing_number_length_invalid);
                    }
                    if (/\D/.test(routing_number)) {
                        errors.push(this.params.routing_number_digits_invalid);
                    }
                }
                if (!account_number) {
                    errors.push(this.params.account_number_missing);
                } else {
                    if (account_number.length < 3 || account_number.length > 17) {
                        errors.push(this.params.account_number_length_invalid);
                    }
                    if (/\D/.test(account_number)) {
                        errors.push(this.params.account_number_invalid);
                    }
                }
                if (errors.length > 0) {
                    this.render_errors(errors);
                    return false;
                } else {
                    this.payment_fields.find('.js-sv-wc-payment-gateway-echeck-form-account-number').val(account_number);
                    return true;
                }
            };

            SV_WC_Payment_Form_Handler.prototype.render_errors = function(errors) {
                $('.woocommerce-error, .woocommerce-message').remove();
                this.form.prepend('<ul class="woocommerce-error"><li>' + errors.join('</li><li>') + '</li></ul>');
                this.form.removeClass('processing').unblock();
                this.form.find('.input-text, select').blur();
                return $('html, body').animate({
                    scrollTop: this.form.offset().top - 100
                }, 1000);
            };

            SV_WC_Payment_Form_Handler.prototype.handle_saved_payment_methods = function() {
                var $csc_field, $new_payment_method_selection, csc_required, id_dasherized;
                id_dasherized = this.id_dasherized;
                csc_required = this.csc_required;
                $new_payment_method_selection = $("div.js-wc-" + id_dasherized + "-new-payment-method-form");
                $csc_field = $new_payment_method_selection.find('.js-sv-wc-payment-gateway-credit-card-form-csc').parent();
                $("input.js-wc-" + this.id_dasherized + "-payment-token").change(function() {
                    var tokenized_payment_method_selected;
                    tokenized_payment_method_selected = $("input.js-wc-" + id_dasherized + "-payment-token:checked").val();
                    if (tokenized_payment_method_selected) {
                        $new_payment_method_selection.slideUp(200);
                        if (csc_required) {
                            $csc_field.removeClass('form-row-last').addClass('form-row-first');
                            return $new_payment_method_selection.after($csc_field);
                        }
                    } else {
                        $new_payment_method_selection.slideDown(200);
                        if (csc_required) {
                            $csc_field.removeClass('form-row-first').addClass('form-row-last');
                            return $new_payment_method_selection.find('.js-sv-wc-payment-gateway-credit-card-form-expiry').parent().after($csc_field);
                        }
                    }
                }).change();
                return $('input#createaccount').change(function() {
                    var $parent_row;
                    $parent_row = $("input.js-wc-" + id_dasherized + "-tokenize-payment-method").closest('p.form-row');
                    if ($(this).is(':checked')) {
                        $parent_row.slideDown();
                        return $parent_row.next().show();
                    } else {
                        $parent_row.hide();
                        return $parent_row.next().hide();
                    }
                }).change();
            };

            SV_WC_Payment_Form_Handler.prototype.handle_sample_check_hint = function() {
                var $sample_check;
                $sample_check = this.payment_fields.find('.js-sv-wc-payment-gateway-echeck-form-sample-check');
                if ($sample_check.is(":visible")) {
                    return $sample_check.slideUp();
                } else {
                    return $sample_check.slideDown();
                }
            };

            SV_WC_Payment_Form_Handler.prototype.block_ui = function() {
                return this.form.block({
                    message: null,
                    overlayCSS: {
                        background: '#fff',
                        opacity: 0.6
                    }
                });
            };

            SV_WC_Payment_Form_Handler.prototype.unblock_ui = function() {
                return this.form.unblock();
            };

            return SV_WC_Payment_Form_Handler;

        })();
    });

}).call(this);
