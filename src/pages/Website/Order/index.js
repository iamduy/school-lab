import React from 'react'
import { useForm } from 'react-hook-form'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { addOrder } from '../../../api/orderAPI'
import { addOrderDetail } from '../../../api/orderDetailAPI'
import { isAuthenticated, OnUpdate } from '../../../auth'
import { deleteAllCart } from '../../../actions/cartAction'
import Swal from 'sweetalert2'
const Order = ({ userProfile, handleLoading }) => {
    const cart = useSelector(data => data.cart.data);
    if (cart !== null) {
        var subtotal = cart.reduce((sum, { sl, price }) => sum + sl * price, 0);
    }
    const { token } = isAuthenticated();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const dispatch = useDispatch();
    const history = useHistory();

    const onHandleSubmit = (data) => {
        const orderData = {
            ...data,
            subtotal: subtotal,
            id_customer: userProfile._id
        };

        console.log(orderData);
        try {
            addOrder(orderData)
                .then(dataOrder => {
                    cart.forEach(({ _id, name, price, category, sl }) => {
                        const orderDetail = {
                            id_product: _id,
                            sl: sl,
                            name: name,
                            price: price,
                            category: category,
                            id_order: dataOrder._id,
                        }
                        addOrderDetail(orderDetail).then(() => {
                            dispatch(deleteAllCart());
                        })
                        console.log('hihi', orderDetail)
                    })
                })
                .then(() => {
                    const newUser = { ...userProfile, history: '' }
                    OnUpdate(newUser, token).then(() => {
                        console.log('hehe update ok')
                    }).catch(error => {
                        console.log(error);
                    })
                })
                .then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: `Đặt hàng thành công !`,
                        showConfirmButton: false,
                        timer: 800
                    })
                }).then(() => {
                    handleLoading(false);
                })
        } catch (error) {
            console.log(error);
        }

    }

    const formOrder = () => (
        <div className='border border-gray-300'>
            <div className=' border-b border-black px-5 py-3 text-md font-light text-main'>
                <i className='fas fa-home ' /> Shipping Address
            </div>
            <div className='p-5'>
                <div className='col-span-6 sm:col-span-3 lg:col-span-2 mb-2'>
                    <label className='block text-sm font-medium text-gray-700'>Customer</label>
                    <input
                        type='text'
                        className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white  shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                        defaultValue={userProfile.name} disabled

                    />
                </div>

                <div className='col-span-6 sm:col-span-3 lg:col-span-2 mb-2'>
                    <label className='block text-sm font-medium text-gray-700'>Consignee</label>
                    <div className='relative'>
                        <input
                            type='text'
                            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            id='consignee'
                            {...register('consignee', { required: true })}
                        />
                        <span className=' text-xs text-red-400 absolute right-1 top-3'>
                            {errors.consignee && errors.consignee.type === 'required' && 'Không được để trống !'}
                        </span>
                    </div>
                </div>
                <div className='col-span-6 sm:col-span-3 lg:col-span-2 mb-2'>
                    <label className='block text-sm font-medium text-gray-700'>Email</label>
                    <div className='relative'>
                        <input
                            type='text'
                            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            {...register('email',
                                {
                                    required: true,
                                    pattern: /\S+@\S+\.\S+/
                                })}
                        />
                        <span className='text-xs text-red-400 absolute right-1 top-3'>
                            {errors.email && errors.email.type === 'required' && 'Không được để trống!'}
                            {errors.email && errors.email.type === 'pattern' && 'Email không đúng định dạng !'}
                        </span>
                    </div>
                </div>
                <div className='col-span-6 sm:col-span-3 lg:col-span-2 mb-2'>
                    <label className='block text-sm font-medium text-gray-700'>Street Address</label>
                    <div className='relative'>
                        <input
                            type='text'
                            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            id='address'
                            {...register('address', { required: true })}
                        />
                        <span className=' text-xs text-red-400 absolute right-1 top-3'>
                            {errors.address && errors.address.type === 'required' && 'Không được để trống !'}
                        </span>
                    </div>
                </div>
                <div className='col-span-6 sm:col-span-3 lg:col-span-2 mb-2'>
                    <label className='block text-sm font-medium text-gray-700'>Phone Number</label>
                    <div className='relative'>
                        <input
                            type='text'
                            className='mt-1 block w-full py-2 px-3 border border-gray-300 bg-whiteshadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                            id='phone'
                            {...register('phone', { required: true, pattern: /((09|03|07|08|05)+([0-9]{8})\b)/ })}
                        />
                        <span className=' text-xs text-red-400 absolute right-1 top-3'>
                            {errors.phone && errors.phone.type === 'required' && 'Không được để trống !'}
                            {errors.phone && errors.phone.type === 'pattern' && 'Phone sai định dạng !'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

    )

    const orderSumary = () => (
        <div className=" mr-10  border border-gray-300">
            <div className=" border-b border-black px-5 py-3 text-md font-light text-main">
                <i className="fas fa-list-ul" /> Order Summary
            </div>
            <div className="p-5">
                <p>{cart.length} ITEM IN CART</p>
                <hr className="my-3 text-gray-500" />
                {cart.map(product => {
                    return (
                        <div className="flex my-3" key={product._id}>
                            <div className="bg-cover bg-center w-1/4 h-32 mr-3 relative"
                                style={{ backgroundImage: `url(http://localhost:4000/api/product/photo/${product._id})` }}
                            >

                            </div>
                            <div className="w-3/4">
                                <p className=" text-xl flex-1 text-left font-normal text-gray-700">{product.name} </p>
                                <p className='w-full flex-1 text-lFg text-left font-light  text-gray-900 mt-1'>x {product.sl}</p>
                                <p className="w-full flex-1 text-lg text-left font-light  text-gray-900 mt-1">${product.price}.00</p>
                            </div>
                        </div>
                    )
                })}

                <div className="mt-5 flex items-center justify-between">
                    <p className="text-left font-light">Subtotal</p>
                    <p className="text-right font-light">${subtotal}.00</p>
                </div>
                <div className=" mt-5 flex items-center justify-between">
                    <p className="text-left font-light">Shipping</p>
                    <p className="text-right font-light">$0.00</p>
                </div>
                <div className=" mt-5 flex items-center justify-between">
                    <p className="text-left font-light">Order Total</p>
                    <p className="text-right text-lg font-light">${subtotal}.00</p>
                </div>
                <button type="submit" className="px-6 py-2 uppercase bg-black text-white w-full mt-5 border hover:border-black hover:text-black hover:bg-white transition duration-300">Place Order</button>
            </div>
        </div>
    )
    return (
        <>
            <form onSubmit={handleSubmit(onHandleSubmit)}>
                <div className='grid grid-cols-2 gap-4 px-20 mb-10'>

                    {cart.length >= 1 ? (
                        <>
                            {formOrder()}
                            {orderSumary()}
                        </>
                    ) : history.push('/')}


                </div>
            </form>



        </>
    )
}

export default Order
