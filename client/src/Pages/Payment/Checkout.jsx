import React, { useEffect } from "react";
import Layout from "../../Layout/Layout";
import { BiRupee } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import {
  getRazorPayId,
  purchaseCourseBundle,
  verifyUserPayment,
} from "../../Redux/razorpaySlice";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";




const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const razorPayKey = useSelector((state) => state.razorpay.key);
  const subscription_id = useSelector(
    (state) => state.razorpay.subscription_id
  );
  const userData = useSelector((state) => state.auth.data);
  const { isPaymentVerified } = useSelector((state) => state.razorpay);





  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);





  // for storing the payment details after successfull transaction
  const paymentDetails = {
    razorpay_payment_id: "",
    razorpay_subscription_id: "",
    razorpay_signature: "",
  };



  const handleSubscription = async (event) => {
    event.preventDefault();

    // checking for empty payment credential
    if (!razorPayKey || !subscription_id) {
      return;
    }

    console.log("Razorpay Key:", razorPayKey);
    console.log("Subscription ID:", subscription_id);


//   const options = {
//     key: razorPayKey, // Enter the Key ID generated from the Dashboard
//     amount: 10000, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
//     currency: "INR",
//     name: "Coursify", //your business name
//     description: "Test Transaction",
//     image: "https://example.com/your_logo",
//     // "order_id": "order_9A33XWu170gUtm", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
//     subscription_id : subscription_id,

//     "handler": function (response){

//       paymentDetails.razorpay_payment_id = response.razorpay_payment_id;
//       paymentDetails.razorpay_subscription_id =
//         response.razorpay_subscription_id;
//       paymentDetails.razorpay_signature = response.razorpay_signature;
//     },
//     "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
//         "name": "Gaurav Kumar", //your customer's name
//         "email": "gaurav.kumar@example.com", 
//         "contact": "9000090000"  //Provide the customer's phone number for better conversion rates 
//     },
//     "notes": {
//         "address": "Razorpay Corporate Office"
//     },
//     "theme": {
//         "color": "#3399cc"
//     }
// };


// const rzp1 = new window.Razorpay(options);

//     // Handle payment failure
//     rzp1.on("payment.failed", function (response) {
//       alert("Payment Failed!");
//       console.log("Error Code:", response.error.code);
//       console.log("Description:", response.error.description);
//       console.log("Source:", response.error.source);
//       console.log("Step:", response.error.step);
//       console.log("Reason:", response.error.reason);
//       console.log("Order ID:", response.error.metadata.order_id);
//       console.log("Payment ID:", response.error.metadata.payment_id);
//     });

//     rzp1.open();


    const options = {
      key: razorPayKey,
      subscription_id: subscription_id,
      name: "Coursify Pvt. Ltd.",
      description: "Monthly Subscription",
      handler: async function (response) {

        console.log("Razorpay Response:", response);

        paymentDetails.razorpay_payment_id = response.razorpay_payment_id;
        paymentDetails.razorpay_subscription_id =
          response.razorpay_subscription_id;
        paymentDetails.razorpay_signature = response.razorpay_signature;

        // displaying the success message
        toast.success("Payment Successfull");

        // //  verifying the payment
        // const res = await dispatch(verifyUserPayment(paymentDetails));

        // // redirecting the user according to the verification status
        // !isPaymentVerified
        // res?.payload?.success
        //  ? navigate("/checkout/success")
        //  : navigate("/checkout/fail");


         const res = await dispatch(verifyUserPayment(paymentDetails));

          if (res?.payload?.success) {
            navigate("/checkout/success");
          } else {
            toast.error("Payment verification failed");
            navigate("/checkout/fail");
          }

      },
      prefill: {
        name: userData.fullName,
        email: userData.email,
      },
      theme: {
        color: "#F37254",
      },
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

 



  useEffect(() => {
  (async () => {
    const razorpayKeyResponse = await dispatch(getRazorPayId());
    if (razorpayKeyResponse?.payload?.key) {
      await dispatch(purchaseCourseBundle());
    } else {
      toast.error("Failed to get Razorpay Key");
    }
  })();
}, []);


  return (
    <Layout>
      {/* checkout page container */}
      <form
        onSubmit={handleSubscription}
        className="min-h-[90vh] flex items-center justify-center text-white"
      >
        {/* checkout card */}
        <div className="w-80 h-[26rem] flex flex-col justify-center shadow-[0_0_10px_black] rounded-lg relative">
          <h1 className="bg-yellow-500 absolute top-0 w-full text-center py-4 text-2xl font-bold rounded-tl-lg rounded-tr-lg">
            Subscription Bundle
          </h1>

          <div className="px-4 space-y-5 text-center">
            <p className="text-[17px]">
              This purchase will allow you to access all the available courses
              of our platform for{" "}
              <span className="text-yellow-500 font-bold">1 Year Duration</span>
              . <br />
              All the existing and new launched courses will be available to you
              in this subscription bundle
            </p>

            <p className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-500">
              <BiRupee /> <span>499</span>only
            </p>

            <div className="text-gray-200">
              <p>100% refund at cancellation</p>
              <p>* Terms & Condition Applied</p>
            </div>
          </div>

          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 transition-all ease-in-out duration-300 absolute bottom-0 w-full text-center py-2 text-xl font-bold rounded-bl-lg rounded-br-lg"
          >
            Buy Now
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default Checkout;
