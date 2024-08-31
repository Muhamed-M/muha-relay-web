import axios from '~/utils/axios';

class UserService {
  async findUsersBySearch(search: string) {
    const { data } = await axios.get('/users/search', {
      params: {
        search,
      },
    });

    return data;
  }
}

export default new UserService();
