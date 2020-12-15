import AppError from '@shared/errors/AppError';

import FakeStorageProvider from '@shared/container/providers/StorageProvider/fakes/FakeStorageProvider';
import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository';
import UpdateUserAvatarService from './UpdateUserAvatarService';

describe('UpdateUserAvatar', () => {
  it('should be able to update avatar', async () => {
    const fakeUsersRepository = new FakeUsersRepository();
    const fakeStorageProvider = new FakeStorageProvider();

    const updateUserAvatar = new UpdateUserAvatarService(
      fakeUsersRepository,
      fakeStorageProvider
    );

    const user = await fakeUsersRepository.create({
      name: 'john doe',
      email: 'johndoe@password.com',
      password: 'password',
    });

    await updateUserAvatar.execute({
      avatarFilename: 'AAAAAAAAAAAa',
      user_id: user.id,
    });

    expect(user.avatar).toBe('AAAAAAAAAAAa');
  });

  it('should not be able to update avatar from non-existent user', async () => {
    const fakeUsersRepository = new FakeUsersRepository();
    const fakeStorageProvider = new FakeStorageProvider();

    const updateUserAvatar = new UpdateUserAvatarService(
      fakeUsersRepository,
      fakeStorageProvider
    );

    // const user = await fakeUsersRepository.create({
    //   name: 'john doe',
    //   email: 'johndoe@password.com',
    //   password: 'password',
    // });

    expect(
      updateUserAvatar.execute({
        avatarFilename: 'AAAAAAAAAAAa',
        user_id: 'non-existing-user',
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should delete old avatar and upload a new one', async () => {
    const fakeUsersRepository = new FakeUsersRepository();
    const fakeStorageProvider = new FakeStorageProvider();

    const deleteFile = jest.spyOn(fakeStorageProvider, 'deleteFile');

    const updateUserAvatar = new UpdateUserAvatarService(
      fakeUsersRepository,
      fakeStorageProvider
    );

    const user = await fakeUsersRepository.create({
      name: 'john doe',
      email: 'johndoe@password.com',
      password: 'password',
    });

    await updateUserAvatar.execute({
      avatarFilename: 'AAAAAAAAAAAa',
      user_id: user.id,
    });

    await updateUserAvatar.execute({
      avatarFilename: 'BBBBBBB',
      user_id: user.id,
    });

    expect(deleteFile).toHaveBeenCalledWith('AAAAAAAAAAAa');
    expect(user.avatar).toBe('BBBBBBB');
  });
});
