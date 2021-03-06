import axios from 'axios';
import { Cookies } from 'react-cookie'
import { popupaction } from '../popupslice/popupslice';
import { cartaction } from './cartslice';
import GetCart from './getcart';
const cookies=new Cookies();
const addCartThuk = (data) => {
  return async (dispatch)=>{
    console.log('insert')
      const addcart=async()=>{
       const response=await axios.post('http://localhost:8000/insert-cart',data,{
            headers:{
              authorization:"Bearer "+cookies.get('token'),
            }
          });
          console.log(response.data)
          if(response.data.cartId){
            cookies.set('cartId',response.data.cartId)
            dispatch(GetCart());
          }
          if(response.data.cartitems){
            dispatch(GetCart());
          }
          if(response.data.errors){
            dispatch(popupaction.setpopupdata({flag:response.data.errors ? true :false,msg:response.data.errors,title:response.data.message}))
          }


          // dispatch(GetCart()) 

          // window.location.reload(false);
        }
        addcart()
}

}
export default addCartThuk;