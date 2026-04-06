const ProfileCard = ({
  name,
  age,
  bio,
  skills,
  image,
  onReject,
  onConnect,
}) => {
  return (
    <div className="w-[350px] bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">

      <img
        src={image}
        alt={name}
        className="w-full h-[400px] object-cover"
      />

      <div className="p-4 space-y-3">

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {name}, {age}
        </h2>

        <p className="text-gray-600 dark:text-gray-300">
          {bio}
        </p>

        <div className="flex flex-wrap gap-2">
          {skills?.map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-md"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="flex justify-between mt-4">

          <button
            onClick={onReject}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Pass
          </button>

          <button
            onClick={onConnect}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
          >
            Connect
          </button>

        </div>
      </div>
    </div>
  );
};

export default ProfileCard;