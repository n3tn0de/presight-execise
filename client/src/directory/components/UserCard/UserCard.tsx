import type { UserSummary } from "@presight/shared";
import { HobbiesTooltip } from "../HobbiesTooltip/HobbiesTooltip";

export function UserCard({
  user,
  selectedHobbies = [],
}: {
  user: UserSummary;
  selectedHobbies?: string[];
}) {
  const selected = new Set(selectedHobbies);
  const orderedHobbies = [...user.hobbies].sort((left, right) => {
    const leftSelected = selected.has(left) ? 0 : 1;
    const rightSelected = selected.has(right) ? 0 : 1;
    if (leftSelected !== rightSelected) return leftSelected - rightSelected;
    return left.localeCompare(right);
  });
  const visibleHobbies = orderedHobbies.slice(0, 2);
  const remainingHobbies = orderedHobbies.slice(2);
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
