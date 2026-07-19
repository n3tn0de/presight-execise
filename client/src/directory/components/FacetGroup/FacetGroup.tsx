import type { FacetValue } from "@presight/shared";

export function FacetGroup({
  title,
  values,
  selected,
  onChange,
}: {
  title: string;
  values: FacetValue[];
  selected: string[];
  onChange: (value: string, checked: boolean) => void;
}) {
  const sortedValues = [...values].sort((left, right) =>
    left.value.localeCompare(right.value),
  );

  return (
    <fieldset className="facet-group">
      <legend>{title}</legend>
      {sortedValues.map((facet) => (
        <label key={facet.value} className="facet-option">
          <input
            type="checkbox"
            checked={selected.includes(facet.value)}
            onChange={(event) => onChange(facet.value, event.target.checked)}
          />
          <span>{facet.value}</span>
          <small>{facet.count}</small>
        </label>
      ))}
    </fieldset>
  );
}
