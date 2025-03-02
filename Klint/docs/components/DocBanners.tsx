interface BannerProps {
  type: "info" | "success" | "warning" | "error";
  children: React.ReactNode;
}

const Banner = ({ type, children }: BannerProps) => {
  const styles = {
    info: "bg-blue-100 border-blue-500 text-blue-700",
    success: "bg-green-100 border-green-500 text-green-700",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
    error: "bg-red-100 border-red-500 text-red-700",
  };

  return <div className={`${styles[type]} p-4 my-4 rounded`}>{children}</div>;
};

export default Banner;
