import type { UserSummary } from "@presight/shared";
import { HobbiesTooltip } from "../HobbiesTooltip/HobbiesTooltip";

export function UserCard({ user }: { user: UserSummary }) {
  const visibleHobbies = user.hobbies.slice(0, 2);
  const remainingHobbies = user.hobbies.slice(2);
  return (
    <article className="user-card">
      {user.avatar ? (
        <img
          className="avatar"
          src={user.avatar}
          alt={`${user.firstName} ${user.lastName}`}
          loading="lazy"
        />
      ) : (
        <div className="avatar" aria-hidden="true" />
      )}
      <div className="user-card__body">
        <h3>
          {user.firstName} {user.lastName}
        </h3>
        <p>
          {user.nationality} <span aria-hidden="true">·</span> age {user.age}
        </p>
        <div className="hobbies" aria-label="Hobbies">
          {visibleHobbies.map((hobby) => (
            <span className="tag" key={hobby}>
              {hobby}
            </span>
          ))}
          {remainingHobbies.length > 0 && (
            <HobbiesTooltip
              hobbies={remainingHobbies}
              id={`hobbies-${user.id}`}
            />
          )}
        </div>
      </div>
    </article>
  );
}
