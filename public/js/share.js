import axios from 'axios';
import { showAlert } from './alerts';

export const createReview = async(review, rating, performancer, date, location) => {
  try {    
    const res = await axios({
      method: "POST",
      url: "/api/reviews",
      data: {review, rating, performancer, date, location}
    });

    if (res.data.status === 'success') {
      showAlert('success', "Shared your experience!");
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};