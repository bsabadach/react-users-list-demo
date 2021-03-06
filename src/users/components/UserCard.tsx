import * as React from 'react'
import cx from 'classnames'

import { SimpleUser } from '..'

import * as styles from './user.css'
import { useCallback, useEffect, useMemo, useState } from 'react'

type Props = {
  user: SimpleUser
  onSelectUser: (selectedUserId: string | undefined) => void
}

export const UserCard = ({ user, onSelectUser }: Props) => {
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    setImageLoaded(user.id !== '')
  }, [user.id])

  const handleSelectUser = useCallback(() => {
    onSelectUser(user.id)
  }, [user])

  const handleImageLoaded = () => {
    setImageLoaded(true)
  }

  return useMemo(
    () => (
      <div
        className={cx(
          'w-full md:w-1/3 lg:w-1/5 flex flex-col mb-8 px-3',
          styles.userCard
        )}
      >
        <div className="relative overflow-hidden bg-white rounded-lg shadow-xl hover:shadow-raised transform transition duration-200 hover:-translate-y-2">
          <div
            className={cx(styles.userImagePlaceholder, {
              [styles.loaded]: imageLoaded || user.id
            })}
          ></div>
          <img
            className={cx('w-full', styles.userImage, {
              [styles.ready]: imageLoaded || user.id
            })}
            src={user.picture}
            alt={user.firstName + ' ' + user.lastName}
            onLoad={handleImageLoaded}
          />

          <div
            className={cx(
              'p-6 flex flex-col justify-between',
              styles.detailWrapper
            )}
          >
            <p className="font-medium text-gray-900 leading-normal mb-2">
              {user.firstName} {user.lastName}
            </p>
            <p
              className="font-hairline text-sm text-gray-500 truncate mb-4"
              title={user.email}
            >
              {user.email}
            </p>
            {imageLoaded && (
              <button
                onClick={handleSelectUser}
                className="text-gray-500 w-full text-right"
              >
                <i className="fas fa-eye fa-fw" />
              </button>
            )}
          </div>
        </div>
      </div>
    ),
    [user.id, imageLoaded]
  )
}
