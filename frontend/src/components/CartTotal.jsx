import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'

const CartTotal = () => {
    const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);
    const subtotal = getCartAmount();
    const total = subtotal + (subtotal > 0 ? delivery_fee : 0);

    return (
        <div className='cart-total'>
            <div className='cart-total-header'>
                <h3>Cart Totals</h3>
            </div>
            
            <div className='cart-total-details'>
                <div className='total-row'>
                    <span>Subtotal</span>
                    <span>{currency}{subtotal}.00</span>
                </div>
                
                <div className='total-row'>
                    <span>Shipping</span>
                    <span>{currency}{delivery_fee}.00</span>
                </div>
                                
                <div className='total-row grand-total'>
                    <span>Total</span>
                    <span>{currency}{total}.00</span>
                </div>
            </div>
        </div>
    )
}

export default CartTotal