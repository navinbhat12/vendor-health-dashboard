export const formatCurrency = (
  value: number | null | undefined,
  compact = false
): string => {
  if (value === null || value === undefined) return "N/A";

  const options: Intl.NumberFormatOptions = {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: compact ? 1 : 2,
  };

  if (compact) {
    if (Math.abs(value) >= 1e12) {
      return `$${(value / 1e12).toFixed(1)}T`;
    } else if (Math.abs(value) >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`;
    } else if (Math.abs(value) >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1e3) {
      return `$${(value / 1e3).toFixed(1)}K`;
    }
  }

  return new Intl.NumberFormat("en-US", options).format(value);
};

export const formatNumber = (
  value: number | null | undefined,
  decimals = 2
): string => {
  if (value === null || value === undefined) return "N/A";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercentage = (
  value: number | null | undefined,
  decimals = 1
): string => {
  if (value === null || value === undefined) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercentageValue = (
  value: number | null | undefined,
  decimals = 1
): string => {
  if (value === null || value === undefined) return "N/A";

  return (
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value) + "%"
  );
};

export const formatRatio = (
  value: number | null | undefined,
  decimals = 2
): string => {
  if (value === null || value === undefined) return "N/A";

  return value.toFixed(decimals);
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return "Invalid Date";
  }
};

export const formatDateTime = (
  dateString: string | null | undefined
): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "Invalid Date";
  }
};

export const formatMarketCap = (value: number | null | undefined): string => {
  return formatCurrency(value, true);
};

export const getMetricStatus = (
  value: number | null | undefined,
  thresholds: { good: number; warning: number },
  reverse = false
): "good" | "warning" | "danger" | "unknown" => {
  if (value === null || value === undefined) return "unknown";

  if (reverse) {
    // For metrics where lower is better (like debt ratios)
    if (value <= thresholds.good) return "good";
    if (value <= thresholds.warning) return "warning";
    return "danger";
  } else {
    // For metrics where higher is better (like current ratio)
    if (value >= thresholds.good) return "good";
    if (value >= thresholds.warning) return "warning";
    return "danger";
  }
};

export const getStatusColor = (
  status: "good" | "warning" | "danger" | "unknown"
): string => {
  switch (status) {
    case "good":
      return "text-success-600";
    case "warning":
      return "text-warning-600";
    case "danger":
      return "text-danger-600";
    default:
      return "text-secondary-500";
  }
};

export const getStatusBadgeClass = (
  status: "good" | "warning" | "danger" | "unknown"
): string => {
  switch (status) {
    case "good":
      return "flag-success";
    case "warning":
      return "flag-warning";
    case "danger":
      return "flag-danger";
    default:
      return "flag-badge bg-secondary-100 text-secondary-800";
  }
};
